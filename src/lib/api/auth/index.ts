import type { AuthState, User } from '@/lib/atoms';
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse } from '@/types/auth';
import type { AxiosResponse } from 'axios';
import type { SetStateAction } from 'react';
import axiosInstance from '../core/axios';

/**
 * 기본 회원가입 API 응답 형식
 * 회원가입 성공 시 서버에서 반환하는 데이터 구조
 */
interface SignupResponse {
  user: {           // 생성된 사용자 정보
    id: string;     // 사용자 고유 ID
    name: string;   // 사용자 이름
    email: string;  // 이메일 주소
    role: string;   // 권한 (일반적으로 'user')
    companyName?: string; // 회사명 (선택적)
  };
  token: string;    // 자동 로그인을 위한 인증 토큰
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

    // 요청 데이터 및 헤더 확인을 위한 로깅
    console.log('[API Auth] 로그인 요청 데이터:', JSON.stringify(credentials));

    // API 요청 - POST /auth/login (최신 백엔드 엔드포인트)
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
      '/auth/login',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('[API Auth] 로그인 응답 받음:', response.status);

    // 응답 데이터 로깅 (디버깅용)
    console.log('[API Auth] 로그인 응답 데이터:', JSON.stringify(response.data));

    // 응답 구조 검사
    if (!response.data) {
      console.error('[API Auth] 로그인 응답 데이터가 없음');
      throw new Error('로그인 응답에 데이터가 없습니다.');
    }

    // 토큰 검사
    if (!response.data.token) {
      console.error('[API Auth] 로그인 응답에 토큰이 없음');
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }

    // 사용자 정보 검사
    if (!response.data.user) {
      console.warn('[API Auth] 로그인 응답에 사용자 정보가 없음, 기본값 생성');
      // 사용자 정보가 없는 경우 기본 사용자 객체 생성
      response.data.user = {
        id: 0, // number 타입으로 설정
        name: '사용자',
        email: credentials.email,
        role: 'user', // role은 필수 필드
        companyName: '회사명 없음',
        phoneNumber: '',
        ceoName: '',
        companyCode: '',
        companyPhoneNumber: ''
      };
    } else if (!response.data.user.role) {
      // 사용자 정보는 있지만 role 필드가 없는 경우 추가
      console.warn('[API Auth] 사용자 정보에 role 필드가 없음, 기본값 추가');
      response.data.user.role = 'user';
    }

    // 응답 데이터 반환
    return response.data;
  } catch (error: any) {
    console.error('[API Auth] 로그인 오류:', error);
    
    // 오류 응답 상세 정보 로깅
    if (error.response) {
      console.error('[API Auth] 오류 상태 코드:', error.response.status);
      console.error('[API Auth] 오류 응답 데이터:', 
        typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data) 
          : error.response.data
      );
      
      // 403 오류일 경우 추가 메시지
      if (error.response.status === 403) {
        console.error('[API Auth] 403 Forbidden 오류 - 접근 권한이 없습니다. 백엔드 관리자에게 문의하세요.');
      }
    }
    
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
export const signup = async (userData: SignUpRequest): Promise<SignUpResponse> => {
  try {
    console.log('[API Auth] 회원가입 시도:', userData.email);

    // API 요청 - POST /auth/signup (최신 백엔드 엔드포인트)
    const response: AxiosResponse<SignUpResponse> = await axiosInstance.post(
      '/auth/signup',
      userData
    );

    console.log('[API Auth] 회원가입 응답:', response.status);
    
    // 응답 구조 검사
    if (!response.data) {
      console.error('[API Auth] 회원가입 응답 데이터가 없음');
      throw new Error('회원가입 응답에 데이터가 없습니다.');
    }

    return response.data;
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
 * @param {Function} setAuth - 인증 상태를 업데이트하는 함수 (선택적)
 * @returns {Object} 성공 여부 객체
 */
export const logout = (setAuth?: (update: SetStateAction<string | null>) => void): object => {
  try {
    console.log('[API Auth] 로그아웃 실행');
    
    // 로컬 스토리지에서 모든 인증 관련 정보 제거
    if (typeof window !== 'undefined') {
      console.log('[API Auth] 로컬 스토리지에서 인증 정보 제거');
      localStorage.removeItem('auth'); // authAtom이 사용하는 키
      localStorage.removeItem('auth_token'); // 일부 API 호출에 사용되는 키
      localStorage.removeItem('token'); // 이전 버전 호환성을 위한 키
    }

    // jotai 상태 초기화 (선택적)
    if (setAuth) {
      console.log('[API Auth] Jotai 상태 초기화');
      setAuth(null);
    }

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
  verifyToken,
};

export default authAPI;
