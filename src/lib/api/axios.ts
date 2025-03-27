import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// 토큰 저장 키
const TOKEN_KEY = 'auth_token';

// 토큰 가져오기 함수
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// 토큰 제거 함수
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// API 기본 URL 설정
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.224:8080/api';

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
    const token = getToken();

    // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // 인증 오류 처리 (401)
    if (error.response?.status === 401) {
      // 토큰 제거
      removeToken();

      // 로그인 페이지로 리다이렉트 (클라이언트 사이드에서만)
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
