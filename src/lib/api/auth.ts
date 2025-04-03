import axios from './axios';
import type { AxiosResponse } from 'axios';
import type { AuthState, User } from '@/lib/atoms';
import type { SetStateAction } from 'react';

// 로그인 응답 타입 정의
interface LoginResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    company?: string;
    // 필요한 사용자 정보 추가
  };
}

// 로그인 요청 타입 정의
interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 함수 (API 호출 전용)
 * @param {LoginRequest} credentials - 로그인 자격 증명
 * @returns {Promise<LoginResponse>} 로그인 응답 (토큰 및 사용자 정보 포함)
 */
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    console.log('[API Auth] 로그인 시도:', credentials.email);
    
    const response: AxiosResponse<LoginResponse> = await axios.post('/users/login', credentials);

    console.log('[API Auth] 로그인 응답 받음:', response.status);
    
    // 응답 데이터 유효성 검사 (토큰 필수)
    if (!response.data?.token) {
      console.error('[API Auth] 로그인 응답에 토큰이 없음');
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }
    
    // user 정보는 선택적일 수 있음 (API 설계에 따라)
    if (!response.data.user) {
        console.warn('[API Auth] 로그인 응답에 사용자 정보가 없음 (토큰만 반환됨)');
    }

    // API 응답 데이터를 그대로 반환
    return response.data;
  } catch (error) {
    console.error('[API Auth] 로그인 오류:', error);
    // 오류를 다시 throw하여 호출한 쪽(LoginForm)에서 처리하도록 함
    throw error;
  }
};

/**
 * 로그아웃 함수
 * @param {Function} setAuth - jotai 상태 설정 함수
 */
export const logout = (setAuth: (update: SetStateAction<string | null>) => void) => {
  try {
    // 로컬 스토리지에서 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    // jotai 상태 초기화
    setAuth(null);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * 토큰 유효성 확인 함수
 * @param {AuthState} auth - 현재 인증 상태
 * @returns {Promise<boolean>} 토큰 유효 여부
 */
export const verifyToken = async (auth: AuthState): Promise<boolean> => {
  try {
    if (!auth.token) {
      console.log('[AUTH] 토큰 검증 - 토큰이 없습니다.');
      return false;
    }

    console.log(`[AUTH] 토큰 검증 - 토큰 확인: ${auth.token.substring(0, 10)}...`);
    
    // axios 인터셉터가 자동으로 Bearer 접두사를 추가하므로 여기서는 별도로 설정하지 않음
    const response = await axios.get('/auth/verify');
    
    console.log(`[AUTH] 토큰 검증 결과: ${response.status === 200 ? '성공' : '실패'}`);
    return response.status === 200;
  } catch (error) {
    console.error('[AUTH] 토큰 검증 오류:', error);
    return false;
  }
};
