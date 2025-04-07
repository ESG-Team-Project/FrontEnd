'use client';

import { authAtom } from '@/lib/atoms/auth';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';
import { ErrorResponse } from '@/types/api';

/**
 * 백엔드 API의 기본 주소 설정
 *
 * 환경 변수에서 API URL을 가져오거나, 기본값을 사용합니다.
 * 개발 환경과 배포 환경에서 다른 URL을 사용할 수 있습니다.
 */
let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 브라우저 환경에서 현재 접속한 호스트를 기반으로 API URL 설정
if (typeof window !== 'undefined') {
  // 환경 변수로 지정된 URL이 없거나 localhost를 포함하는 경우
  if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    const host = window.location.hostname;
    // localhost가 아닌 경우, 현재 접속한 호스트를 사용
    if (host !== 'localhost' && host !== '127.0.0.1') {
      baseURL = `http://${host}:8080/api`;
    }
  }
}

console.log('[AXIOS] API 기본 URL:', baseURL);

// 로컬 스토리지에 인증 정보를 저장할 때 사용하는 키
const TOKEN_KEY = 'auth';

/**
 * 인증 토큰을 가져오는 함수
 *
 * Jotai 상태 관리 라이브러리의 저장소에서 먼저 토큰을 확인하고,
 * 없으면 로컬 스토리지에서 토큰을 찾습니다.
 *
 * @returns {string | null} 인증 토큰 또는 토큰이 없는 경우 null
 */
export const getTokenFromAtom = (): string | null => {
  // 서버 사이드 렌더링 환경인 경우 null 반환
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Jotai 저장소에서 인증 상태 가져오기
    const store = getDefaultStore();
    const auth = store.get(authAtom);

    console.log('[AXIOS] Jotai에서 토큰 확인:', auth?.token ? '있음' : '없음');

    // Jotai에 토큰이 있으면 사용
    if (auth?.token) {
      return auth.token;
    }

    // Jotai에 없으면 로컬 스토리지에서 확인
    const authJson = localStorage.getItem(TOKEN_KEY);
    if (authJson) {
      try {
        const authData = JSON.parse(authJson);
        console.log('[AXIOS] 로컬 스토리지에서 토큰 확인:', authData?.token ? '있음' : '없음');
        if (authData?.token) {
          // 토큰을 찾았으면 Jotai 저장소에도 설정 (동기화)
          if (authData.user) {
            console.log('[AXIOS] 로컬 스토리지 토큰을 Jotai에 동기화 시도');
            store.set(authAtom, {
              isLoggedIn: true,
              token: authData.token,
              user: authData.user,
              isLoading: false
            });
          }
          return authData.token;
        }
      } catch (e) {
        console.error('[AXIOS] 로컬 스토리지 JSON 파싱 오류:', e);
      }
    } else {
      console.log('[AXIOS] 로컬 스토리지에 토큰 없음');
    }

    return null;
  } catch (error) {
    console.error('[AXIOS] 토큰 로딩 오류:', error);
    return null;
  }
};

/**
 * Axios 인스턴스 생성
 *
 * 모든 API 요청에 공통으로 적용될 기본 설정을 포함한 axios 인스턴스입니다.
 * 이 인스턴스를 통해 요청하면 자동으로 baseURL, 타임아웃, 헤더 등이 적용됩니다.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL, // 기본 URL (위에서 설정한 값)
  timeout: 10000, // 요청 타임아웃 (10초)
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type 헤더
  },
});

/**
 * 요청 인터셉터 설정
 *
 * 모든 API 요청이 서버로 전송되기 전에 실행되는 코드입니다.
 * 여기서는 인증 토큰이 있으면 자동으로 헤더에 추가합니다.
 *
 * 사용 예시:
 * - 요청 시 자동으로 Authorization 헤더에 토큰이 추가됨
 * - API 호출 시 따로 토큰을 설정하지 않아도 됨
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰 가져오기
    const token = getTokenFromAtom();
    console.log('[AXIOS] 요청 인터셉터:', config.url, token ? '토큰 있음' : '토큰 없음');
    
    // 특정 경로인 경우 추가 디버깅 정보 출력
    if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/signup'))) {
      console.log(`[AXIOS] ${config.url} 요청 상세:`, {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers,
        // 민감한 정보는 제외하고 로깅
        data: config.data ? {...config.data, password: '***', checkPassword: '***'} : undefined
      });
    }
    
    // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[AXIOS] 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터 설정
 *
 * 서버에서 응답이 도착한 후 처리하는 코드입니다.
 * 특정 오류 상황(예: 401 Unauthorized)에 대한 공통 처리 로직을 구현합니다.
 *
 * 401 오류는 보통 토큰이 만료되었거나 유효하지 않을 때 발생합니다.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 오류 응답에서 상태 코드 확인
    const status = error.response?.status;
    const errorData = error.response?.data as ErrorResponse | undefined;
    
    // 백엔드 에러 응답 형식에 맞게 로깅
    console.error(`[AXIOS] 응답 오류: ${status}`, error.config?.url);
    
    if (errorData) {
      console.error(`[AXIOS] 오류 상세: 
        코드: ${errorData.code || 'N/A'}
        메시지: ${errorData.message || 'N/A'}
        경로: ${errorData.path || 'N/A'}
        타임스탬프: ${errorData.timestamp || 'N/A'}
      `);
      
      // 유효성 검증 오류가 있는 경우 로깅
      if (errorData.errors && errorData.errors.length > 0) {
        console.error('[AXIOS] 유효성 검증 오류:', errorData.errors);
      }
    } else if (error.response?.data) {
      // 백엔드가 ErrorResponse 형식이 아닌 데이터를 반환한 경우
      console.error('[AXIOS] 응답 데이터(형식화되지 않음):', error.response.data);
      
      // 응답이 문자열인 경우
      if (typeof error.response.data === 'string') {
        console.error('[AXIOS] 오류 메시지(문자열):', error.response.data);
      }
      
      // JSON 객체이지만 ErrorResponse 형식이 아닌 경우
      if (typeof error.response.data === 'object') {
        const unknownErrorData = error.response.data;
        
        // 가능한 오류 메시지 필드 시도
        const possibleMessageFields = ['message', 'error', 'errorMessage', 'detail', 'description'];
        for (const field of possibleMessageFields) {
          if (unknownErrorData[field]) {
            console.error(`[AXIOS] 가능한 오류 메시지 (${field}):`, unknownErrorData[field]);
          }
        }
      }
    }
    
    // 401 Unauthorized 오류 (인증 만료) 또는 403 Forbidden 오류 (권한 부족)
    if (status === 401 || status === 403) {
      console.error(`[AXIOS] 인증 오류 (${status}): 자동 로그아웃 처리 및 리디렉션`);
      
      // 로컬 스토리지의 인증 정보 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        
        // 현재 페이지가 로그인 페이지가 아닌 경우에만 리디렉션
        if (!window.location.pathname.includes('/login')) {
          console.log('[AXIOS] 로그인 페이지로 리디렉션');
          // 현재 URL을 리디렉션 파라미터로 전달 (선택적)
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?redirectTo=${returnUrl}`;
        }
      }
    }
    
    // 500 Internal Server Error
    else if (status === 500) {
      console.error('[AXIOS] 서버 오류:', errorData || error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// 구성된 axios 인스턴스를 내보냅니다. 이 인스턴스를 사용하여 API 요청을 보냅니다.
export default axiosInstance;
