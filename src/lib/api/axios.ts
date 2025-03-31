import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';
import { authAtom } from '@/lib/atoms/auth';

// API 기본 URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.224:8080/api';
console.log('[AXIOS] API 기본 URL:', baseURL);

// 토큰 저장 키 - fallback으로 사용
const TOKEN_KEY = 'auth';
const LEGACY_TOKEN_KEY = 'auth_token'; // 이전 버전과의 호환성을 위해 유지

// Jotai 스토어에서 토큰 가져오기 (다양한 방법 시도)
export const getTokenFromAtom = (): string | null => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    console.log('[AXIOS] 서버 사이드 렌더링 중 - 토큰 없음');
    return null;
  }

  try {
    // 방법 1: Jotai getDefaultStore 사용
    const store = getDefaultStore();
    const auth = store.get(authAtom);
    
    if (auth?.token) {
      console.log('[AXIOS] Jotai 스토어에서 토큰 찾음');
      return auth.token;
    }
    
    // 방법 2: localStorage에서 직접 auth 객체 파싱 시도
    const authJson = localStorage.getItem(TOKEN_KEY);
    if (authJson) {
      try {
        const authData = JSON.parse(authJson);
        if (authData?.token) {
          console.log('[AXIOS] 로컬 스토리지(JSON)에서 토큰 찾음');
          return authData.token;
        }
      } catch (e) {
        console.error('[AXIOS] 로컬 스토리지 JSON 파싱 오류:', e);
      }
    }
    
    // 방법 3: 이전 버전과의 호환성을 위해 auth_token에서도 확인
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacyToken) {
      console.log('[AXIOS] 레거시 토큰 저장소에서 토큰 찾음');
      return legacyToken;
    }
    
    console.log('[AXIOS] 토큰을 찾을 수 없음');
    return null;
  } catch (error) {
    console.error('[AXIOS] 토큰 로딩 오류:', error);
    return null;
  }
};

// axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  config => {
    const token = getTokenFromAtom();

    // API 요청 로깅
    console.log(`[AXIOS 요청] ${config.method?.toUpperCase()} ${config.url}`);

    // 토큰이 있으면 헤더에 추가
    if (token) {
      // 토큰에 Bearer 접두사를 추가 (이미 있으면 추가하지 않음)
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
      
      // 요청 헤더 로깅 (토큰 일부만 표시)
      const tokenPreview = `${formattedToken.substring(0, 15)}...`;
      console.log(`[AXIOS 요청] 인증 헤더: ${tokenPreview}`);
    } else {
      console.log('[AXIOS 요청] 인증 토큰 없음 - 요청 헤더에 Authorization이 설정되지 않음');
    }

    return config;
  },
  error => {
    console.error('[AXIOS 요청 오류]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  response => {
    // 요청 URL과 메서드 정보 추출
    const { method, url } = response.config;
    // 성공 응답 로깅
    console.log(`[AXIOS 응답] ${method?.toUpperCase()} ${url} - 상태: ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    // 요청 정보 추출
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';
    const status = error.response?.status || 'UNKNOWN';
    
    // 오류 응답 로깅
    console.error(`[AXIOS 오류] ${method} ${url} - 상태: ${status}`);
    
    if (error.response?.data) {
      console.error('[AXIOS 오류 데이터]', error.response.data);
    }
    
    // 인증 오류 처리 (401)
    if (error.response?.status === 401) {
      console.log('[AXIOS 인증 오류] 401 Unauthorized - 토큰이 유효하지 않거나 만료됨');
      
      // 로그인 페이지로 리다이렉트 (클라이언트 사이드에서만)
      if (typeof window !== 'undefined') {
        // 현재 경로를 쿼리 파라미터로 추가
        const currentPath = window.location.pathname;
        const redirectPath = encodeURIComponent(currentPath);
        // 원본 코드에서는 '/auth/login'을 사용
        window.location.href = `/auth/login?redirectTo=${redirectPath}`;
      }
    } else if (error.response?.status === 403) {
      console.log('[AXIOS 인증 오류] 403 Forbidden - 접근 권한이 없음');
      
      // 현재 토큰 상태 로깅
      const token = getTokenFromAtom();
      console.log(`[AXIOS 인증 오류] 현재 토큰: ${token ? `${token.substring(0, 10)}...` : '없음'}`);
      
      // 현재 로컬 스토리지 상태 확인
      if (typeof window !== 'undefined') {
        const authJson = localStorage.getItem(TOKEN_KEY);
        const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
        console.log(`[AXIOS 인증 오류] 로컬 스토리지 auth: ${authJson ? '존재' : '없음'}`);
        console.log(`[AXIOS 인증 오류] 레거시 토큰: ${legacyToken ? '존재' : '없음'}`);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
