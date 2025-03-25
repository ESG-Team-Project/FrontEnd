import axiosInstance from './axios';
import { AxiosResponse } from 'axios';

// 토큰 저장 키
const TOKEN_KEY = 'auth_token';

// 로그인 응답 타입 정의
interface LoginResponse {
  token: string;
  user?: {
    id: number;
    username: string;
    email: string;
    // 필요한 사용자 정보 추가
  };
}

// 로그인 요청 타입 정의
interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 함수
 * @param {LoginRequest} credentials - 로그인 자격 증명
 * @returns {Promise<LoginResponse>} 로그인 응답
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post('/auth/login', credentials);
    
    // 토큰 저장
    const { token } = response.data;
    setToken(token);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 로그아웃 함수
 */
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/auth/login';
  }
};

/**
 * 토큰 저장 함수
 * @param {string} token - 저장할 토큰
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * 토큰 유효성 확인 함수
 * @returns {Promise<boolean>} 토큰 유효 여부
 */
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    const response = await axiosInstance.get('/auth/verify');
    return response.status === 200;
  } catch (error) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    return false;
  }
}; 