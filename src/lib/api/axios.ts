import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getDefaultStore } from 'jotai';
import { authAtom } from '@/lib/atoms/auth';

// API 기본 URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.224:8080/api';
console.log('[AXIOS] API 기본 URL:', baseURL);

// 토큰 저장 키
const TOKEN_KEY = 'auth';

// Jotai 스토어에서 토큰 가져오기
export const getTokenFromAtom = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const store = getDefaultStore();
    const auth = store.get(authAtom);

    if (auth?.token) {
      return auth.token;
    }

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

// axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  config => {
    const token = getTokenFromAtom();

    if (token) {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // 인증 오류 처리 (401) - 에러 로그만 남기고 에러를 전파
    if (error.response?.status === 401) {
      console.error(
        '[AXIOS Interceptor] 401 Unauthorized Error detected. Propagating error.',
        error
      );
      // 직접적인 리다이렉션 로직 제거 - ProtectedRoute에서 처리하도록 함
      // if (typeof window !== 'undefined') {
      //   const currentPath = window.location.pathname;
      //   const redirectPath = encodeURIComponent(currentPath);
      //   window.location.href = `/login?redirectTo=${redirectPath}`;
      // }
    }
    // 다른 에러들도 그대로 전파
    return Promise.reject(error);
  }
);

export default axiosInstance;
