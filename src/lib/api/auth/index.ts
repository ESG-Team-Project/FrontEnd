import axiosInstance from '../core/axios';
import type { AxiosResponse } from 'axios';
import type { AuthState, User } from '@/lib/atoms';
import type { SetStateAction } from 'react';
import type { 
  LoginRequest, 
  LoginResponse, 
  SignUpRequest, 
  SignUpResponse 
} from '@/types/auth';

// 내부 변환 용도로 사용하는 타입
interface InternalSignupResponse extends SignUpResponse {
  token?: string;
}

/**
 * 로그인 기능
 * 
 * 이메일과 비밀번호로 사용자를 인증하고 토큰을 받아옵니다.
 * 
 * @param {LoginRequest} credentials - 이메일과 비밀번호 객체
 * @returns {Promise<LoginResponse>} 토큰과 사용자 정보가 포함된 응답
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    console.log('[API Auth] 로그인 시도:', credentials.email);

    // API 요청 - POST /users/login
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post('/users/login', credentials);

    console.log('[API Auth] 로그인 응답 받음:', response.status);

    // 응답에 토큰이 없으면 오류 처리
    if (!response.data?.token) {
      console.error('[API Auth] 로그인 응답에 토큰이 없음');
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }

    // 응답 데이터 반환
    return response.data;
  } catch (error) {
    console.error('[API Auth] 로그인 오류:', error);
    // 오류를 그대로 전파 (컴포넌트에서 처리)
    throw error;
  }
};

/**
 * 회원가입 기능
 * 
 * 회원가입을 처리하고 결과를 반환합니다.
 * 
 * @param {SignUpRequest} userData - 회원가입 정보
 * @returns {Promise<SignUpResponse>} 회원가입 결과
 */
export const signup = async (userData: SignUpRequest): Promise<InternalSignupResponse> => {
  try {
    console.log('[API Auth] 회원가입 시도:', userData.email);
    
    // API 요청 - POST /users/signup
    const response: AxiosResponse<SignUpResponse> = await axiosInstance.post(
      '/users/signup',
      userData
    );
    
    console.log('[API Auth] 회원가입 응답:', response.status);
    
    // 응답이 빈 객체인지 확인
    if (!response.data || Object.keys(response.data).length === 0) {
      console.error('[API Auth] 회원가입 응답이 비어있음');
      throw new Error(`예상과 다른 회원가입 응답 형식: ${JSON.stringify(response.data)}`);
    }
    
    // API 응답 그대로 반환 (token 필드 추가)
    const responseWithToken: InternalSignupResponse = {
      ...response.data,
      token: 'temporary-token' // 토큰이 없으면 임시 토큰 사용
    };

    return responseWithToken;
  } catch (error) {
    console.error('[API Auth] 회원가입 오류:', error);
    // 오류를 그대로 전파 (컴포넌트에서 처리)
    throw error;
  }
};

/**
 * 로그아웃 기능
 * 
 * 로컬 스토리지와 상태 관리 라이브러리에서 인증 정보를 제거합니다.
 * 
 * @param {Function} setAuth - 인증 상태를 업데이트하는 함수 (jotai의 setState)
 * @returns {Object} 성공 여부 객체
 */
export const logout = (setAuth: (update: SetStateAction<string | null>) => void): object => {
  try {
    // 로컬 스토리지에서 토큰 제거 (브라우저 환경인 경우)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    // jotai 상태 초기화 (null로 설정)
    setAuth(null);

    return { success: true };
  } catch (error) {
    console.error('[API Auth] 로그아웃 오류:', error);
    throw error;
  }
};

/**
 * 토큰 유효성 검증 기능
 * 
 * 현재 저장된 토큰이 유효한지 서버에 확인 요청합니다.
 * 주로 페이지 로드 시나 보안이 필요한 작업 전에 호출합니다.
 * 
 * @param {AuthState} auth - 현재 인증 상태 객체
 * @returns {Promise<boolean>} 토큰 유효 여부 (true: 유효, false: 유효하지 않음)
 */
export const verifyToken = async (auth: AuthState): Promise<boolean> => {
  try {
    if (!auth.token) {
      console.log('[AUTH] 토큰 검증 - 토큰이 없습니다.');
      return false;
    }

    console.log(`[AUTH] 토큰 검증 - 토큰 확인: ${auth.token.substring(0, 10)}...`);

    // 토큰 검증 API 호출 (axios 인스턴스가 자동으로 토큰을 헤더에 추가)
    const response = await axiosInstance.get('/auth/verify');

    console.log(`[AUTH] 토큰 검증 결과: ${response.status === 200 ? '성공' : '실패'}`);
    return response.status === 200;
  } catch (error) {
    console.error('[AUTH] 토큰 검증 오류:', error);
    return false;
  }
};

// default export 추가
const authAPI = {
  login,
  signup,
  logout,
  verifyToken
};

export default authAPI;
