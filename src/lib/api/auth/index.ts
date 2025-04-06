import axiosInstance from '../core/axios';
import type { AxiosResponse } from 'axios';
import type { AuthState, User } from '@/lib/atoms';
import type { SetStateAction } from 'react';

/**
 * 로그인 API 응답 형식
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    department: string;
    position: string;
    companyName: string;
    ceoName: string;
    companyCode: string;
    companyPhoneNumber: string;
    phoneNumber: string;
    companyId: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * 로그인 API 요청 형식
 * 로그인 시 서버로 전송하는 데이터 구조
 */
interface LoginRequest {
  email: string;     // 사용자 이메일
  password: string;  // 비밀번호
}

/**
 * 회원가입 API 요청 형식
 */
export interface SignUpRequest {
  email: string;             // 이메일 주소
  password: string;          // 비밀번호
  checkPassword: string;     // 비밀번호 확인용
  name: string;              // 사용자 이름
  companyName: string;       // 회사명
  ceoName: string;           // 대표자명
  companyCode: string;       // 사업자등록번호
  companyPhoneNumber: string; // 회사 전화번호
  phoneNumber: string;       // 사용자 전화번호
}

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
 * 회원가입 API 응답 형식
 */
export interface SignUpResponse {
  id: number;              // 사용자 고유 ID (숫자)
  email: string;           // 이메일 주소
  name: string;            // 사용자 이름
  department?: string;     // 부서 (선택적)
  position?: string;       // 직위 (선택적)
  companyName: string;     // 회사명
  ceoName: string;         // 대표자명
  companyCode: string;     // 사업자등록번호
  companyPhoneNumber: string; // 회사 전화번호
  phoneNumber: string;     // 사용자 전화번호
  companyId: number;       // 회사 ID
  createdAt: string;      // 계정 생성 일시
  updatedAt: string;      // 계정 정보 업데이트 일시
  token?: string;          // 인증 토큰 (선택적)
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
 * @returns {Promise<SignupResponse>} 회원가입 결과
 */
export const signup = async (userData: SignUpRequest): Promise<SignupResponse> => {
  try {
    console.log('[API Auth] 회원가입 시도:', userData.email);
    
    // API 요청 - POST /users/signup
    const response: AxiosResponse<SignUpResponse> = await axiosInstance.post(
      '/users/signup',
      userData
    );
    
    console.log('[API Auth] 회원가입 응답:', response.status);
    
    // 응답 형식 변환 (표준화)
    const standardResponse: SignupResponse = {
      user: {
        id: String(response.data.id),  // 숫자를 문자열로 변환
        name: response.data.name,
        email: response.data.email,
        role: 'user',                   // 기본 권한: 'user'
        companyName: response.data.companyName
      },
      token: response.data.token || 'temporary-token' // 토큰이 없으면 임시 토큰 사용
    };

    return standardResponse;
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
 * 
 * 사용 예시:
 * ```typescript
 * const [, setAuth] = useAtom(authAtom);
 * 
 * const handleLogout = () => {
 *   logout(setAuth);
 *   router.push('/login');
 * };
 * ```
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
 * 
 * 사용 예시:
 * ```typescript
 * const [auth] = useAtom(authAtom);
 * 
 * useEffect(() => {
 *   const checkToken = async () => {
 *     const isValid = await verifyToken(auth);
 *     if (!isValid) {
 *       router.push('/login');
 *     }
 *   };
 *   checkToken();
 * }, []);
 * ```
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