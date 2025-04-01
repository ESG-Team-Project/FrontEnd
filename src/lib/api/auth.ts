import axiosInstance from './axios';
import type { AxiosResponse } from 'axios';
import type { AuthState, User } from '@/lib/atoms/auth';
import { login as loginJotai, logout as logoutJotai } from '@/lib/atoms/auth';

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
 * 로그인 함수
 * @param {LoginRequest} credentials - 로그인 자격 증명
 * @param {Function} setAuth - jotai 상태 설정 함수
 * @returns {Promise<LoginResponse>} 로그인 응답
 */
export const login = async (
  credentials: LoginRequest, 
  setAuth: (update: AuthState) => void
): Promise<LoginResponse> => {
  try {
    console.log('[AUTH] 로그인 시도:', credentials.email);
    
    // 실제 API 호출
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
      '/users/login',
      credentials
    );

    // 응답에서 필요한 데이터 추출
    const { token, user } = response.data;
    
    console.log('[AUTH] 로그인 응답 받음:', response.status);
    
    if (!token) {
      console.error('[AUTH] 로그인 응답에 토큰이 없음');
      throw new Error('로그인 응답에 토큰이 없습니다');
    }
    
    if (user) {
      // 사용자 데이터 변환
      const userData: User = {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        company: user.company
      };
      
      // 토큰에서 Bearer 접두사 제거 후 저장
      let tokenValue = token;
      if (token.startsWith('Bearer ')) {
        tokenValue = token.substring(7);
        console.log('[AUTH] Bearer 접두사 제거됨');
      }
      
      // 디버깅용 로그
      console.log('[AUTH] 원본 토큰:', `${token.substring(0, 10)}...`);
      console.log('[AUTH] 저장할 토큰 값:', `${tokenValue.substring(0, 10)}...`);
      
      // 토큰과 사용자 데이터를 Jotai 상태에 저장
      loginJotai(setAuth, userData, tokenValue);
      
      // 저장 확인 - 브라우저 환경에서만 실행
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          // 비동기적으로 저장 확인
          const storedAuth = localStorage.getItem('auth');
          console.log('[AUTH] 로그인 후 localStorage 상태:', storedAuth ? '저장됨' : '저장 안됨');
          
          try {
            if (storedAuth) {
              const parsedAuth = JSON.parse(storedAuth);
              console.log('[AUTH] 저장된 토큰 확인:', parsedAuth.token ? `${parsedAuth.token.substring(0, 10)}...` : '없음');
            }
          } catch (e) {
            console.error('[AUTH] localStorage 파싱 오류:', e);
          }
        }, 100);
      }
    } else {
      console.error('[AUTH] 로그인 응답에 사용자 정보가 없음');
    }

    return response.data;
  } catch (error) {
    console.error('[AUTH] 로그인 오류:', error);
    throw error;
  }
};

/**
 * 로그아웃 함수
 * @param {Function} setAuth - jotai 상태 설정 함수
 */
export const logout = (setAuth: (update: AuthState) => void): void => {
  // jotai에서 로그아웃 (atomWithStorage를 사용하므로 자동으로 localStorage도 업데이트)
  logoutJotai(setAuth);
  
  // 선택적: 로그아웃 후 리다이렉션
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
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
    const response = await axiosInstance.get('/auth/verify');
    
    console.log(`[AUTH] 토큰 검증 결과: ${response.status === 200 ? '성공' : '실패'}`);
    return response.status === 200;
  } catch (error) {
    console.error('[AUTH] 토큰 검증 오류:', error);
    return false;
  }
};
