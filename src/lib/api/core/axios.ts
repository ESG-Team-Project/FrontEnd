'use client';

import { authAtom } from '@/lib/atoms/auth';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';

/**
 * 백엔드 API의 기본 주소 설정
 *
 * 환경 변수에서 API URL을 가져오거나, 기본값을 사용합니다.
 * 개발 환경과 배포 환경에서 다른 URL을 사용할 수 있습니다.
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
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

    // Jotai에 토큰이 있으면 사용
    if (auth?.token) {
      return auth.token;
    }

    // Jotai에 없으면 로컬 스토리지에서 확인
    const authJson = localStorage.getItem(TOKEN_KEY);
    if (authJson) {
      try {
        const authData = JSON.parse(authJson);
        if (authData?.token) {
          return authData.token;
        }
      } catch (e) {
        console.error('[AXIOS] 로컬 스토리지 JSON 파싱 오류:', e);
      }
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

    // 토큰이 있으면 Authorization 헤더에 추가
    if (token) {
      // Bearer 접두사와 공백이 있는지 확인
      const formattedToken = token.startsWith('Bearer ') 
        ? token 
        : `Bearer ${token}`;  // 'Bearer ' 문자열과 공백 포함 필수
      config.headers.Authorization = formattedToken;
    }

    return config;
  },
  (error) => {
    // 요청 전송 중 오류가 발생하면 Promise.reject로 오류를 전파
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
  // 응답이 성공적인 경우 그대로 반환
  (response) => response,

  // 오류 응답 처리
  (error: AxiosError) => {
    // API 요청이 401 (Unauthorized) 오류일 경우 처리
    if (error.response?.status === 401) {
      console.error('[AXIOS] 401 인증 오류 발생. 토큰이 만료되었거나 유효하지 않습니다.', error);
      
      // 로컬 스토리지에서 토큰 제거 (만료된 토큰 정리)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }

      // 로그인 페이지로 리다이렉션 (현재 경로 저장)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const redirectPath = encodeURIComponent(currentPath);
        window.location.href = `/login?redirectTo=${redirectPath}`;
      }
    }
    
    // 403 (Forbidden) 오류 처리
    if (error.response?.status === 403) {
      console.error('[AXIOS] 403 권한 오류 발생. 접근 권한이 없습니다.', error);
    }
    
    // 500 (Internal Server Error) 오류 처리
    if (error.response?.status === 500) {
      console.error('[AXIOS] 500 서버 오류 발생.', error);
      
      // 응답에 상세 오류 정보가 있으면 로그에 기록
      if (error.response.data) {
        try {
          console.error('[AXIOS] 서버 오류 상세 정보:', 
            typeof error.response.data === 'string' 
              ? error.response.data 
              : JSON.stringify(error.response.data)
          );
        } catch (e) {
          console.error('[AXIOS] 오류 정보 파싱 실패');
        }
      }
    }

    // 모든 오류는 호출한 컴포넌트에서 처리할 수 있도록 전파
    return Promise.reject(error);
  }
);

// 구성된 axios 인스턴스를 내보냅니다. 이 인스턴스를 사용하여 API 요청을 보냅니다.
export default axiosInstance;
