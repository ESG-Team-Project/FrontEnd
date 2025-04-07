import type { AuthState, User } from '@/lib/atoms';
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse, TokenVerificationRequest, TokenVerificationResponse } from '@/types/auth';
import type { AxiosResponse } from 'axios';
import type { SetStateAction } from 'react';
import type { ErrorResponse } from '@/types/api';
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

    // 백엔드 요구사항에 맞게 데이터 형식 조정 (필요한 경우)
    const requestData = {
      ...userData,
      // 필요한 추가 필드가 있다면 여기에 추가
    };

    // API 요청 전 디버깅 정보
    console.log('[API Auth] 회원가입 요청 데이터:', {
      ...requestData,
      password: '***',
      checkPassword: '***'
    });

    // API 요청 - POST /auth/signup (최신 백엔드 엔드포인트)
    const response: AxiosResponse<SignUpResponse> = await axiosInstance.post(
      '/auth/signup',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('[API Auth] 회원가입 응답:', response.status);
    console.log('[API Auth] 회원가입 응답 데이터:', response.data);
    
    // 응답 구조 검사
    if (!response.data) {
      console.error('[API Auth] 회원가입 응답 데이터가 없음');
      throw new Error('회원가입 응답에 데이터가 없습니다.');
    }

    return response.data;
  } catch (error: any) {
    console.error('[API Auth] 회원가입 오류:', error);
    
    // 오류 응답의 상세 정보 로깅
    if (error.response) {
      const status = error.response.status;
      
      // 백엔드 응답 데이터 분석
      try {
        const errorData = error.response.data as ErrorResponse;
        console.error(`[API Auth] 회원가입 오류 (${status}):`, errorData);
        
        // 유효성 검증 오류가 있는 경우 자세히 로깅
        if (errorData.errors && errorData.errors.length > 0) {
          const fields = errorData.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          console.error(`[API Auth] 유효성 검증 오류: ${fields}`);
        }
        
        // 백엔드 응답이 일반 문자열만 포함하는 경우
        if (typeof errorData === 'string') {
          console.error(`[API Auth] 오류 메시지: ${errorData}`);
        }
        
        // 백엔드 응답에 오류 세부 정보가 없는 경우의 fallback 처리
        if (!errorData.errors && !errorData.message && status === 400) {
          console.error('[API Auth] 유효성 검증 실패 - 세부 정보 없음');
          
          // 가장 일반적인 유효성 검증 오류 (추론)
          const fields = Object.keys(userData);
          console.error('[API Auth] 확인이 필요한 필드:', fields);
        }
      } catch (parseError) {
        console.error('[API Auth] 오류 응답 파싱 실패:', parseError);
        console.error('[API Auth] 원본 오류 응답:', error.response.data);
      }
    }
    
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

    // GET에서 POST로 변경하고 요청 본문에 토큰 포함
    const requestData: TokenVerificationRequest = {
      token: auth.token
    };

    console.log('[AUTH] 토큰 검증 요청 전송:', {
      method: 'POST',
      url: '/auth/verify',
      token: `${auth.token.substring(0, 10)}...` // 로그에는 토큰 일부만 표시
    });

    // 토큰 검증 API 호출 (POST 메서드로 변경)
    const response = await axiosInstance.post<TokenVerificationResponse>(
      '/auth/verify',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const isValid = response.status === 200 && response.data.valid === true;
    console.log(`[AUTH] 토큰 검증 결과: ${isValid ? '성공' : '실패'}`);
    
    if (isValid && response.data.exp) {
      // 만료 시간 정보가 있는 경우, 만료까지 남은 시간 계산
      const expiresAt = new Date(response.data.exp * 1000);
      const now = new Date();
      const timeLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60); // 분 단위
      console.log(`[AUTH] 토큰 만료 시간: ${timeLeft}분 남음`);
    }

    return isValid;
  } catch (error: any) {
    console.error('[AUTH] 토큰 검증 오류:', error);
    
    // 오류 응답 로깅
    if (error.response) {
      console.error('[AUTH] 토큰 검증 응답 상태:', error.response.status);
      console.error('[AUTH] 토큰 검증 응답 데이터:', error.response.data);
    }
    
    return false;
  }
};

// 현재 API 기본 URL 가져오는 함수
export const getApiBaseUrl = (): string => {
  return axiosInstance.defaults.baseURL || '';
};

// default export 추가
const authAPI = {
  login,
  signup,
  logout,
  verifyToken,
  getApiBaseUrl,
};

export default authAPI;
