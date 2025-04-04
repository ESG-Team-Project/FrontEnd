import axiosInstance from '../core/axios';
import type { AxiosResponse } from 'axios';
import type { AuthState, User } from '@/lib/atoms';
import type { SetStateAction } from 'react';

/**
 * 로그인 API 응답 형식
 * 서버에서 로그인 성공 시 반환하는 데이터 구조
 */
interface LoginResponse {
  token: string;  // 사용자 인증 토큰 (JWT)
  user?: {        // 사용자 정보 (선택적)
    id: string;   // 사용자 고유 ID
    username: string;  // 사용자 이름
    email: string;     // 이메일 주소
    role: string;      // 권한 (admin, user 등)
    company?: string;  // 회사명 (선택적)
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
 * 기본 회원가입 API 요청 형식
 * 간단한 회원가입 시 서버로 전송하는 데이터 구조
 */
interface SignupRequest {
  email: string;     // 사용자 이메일
  password: string;  // 비밀번호
  name: string;      // 사용자 이름
  company?: string;  // 회사명 (선택적)
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
    company?: string; // 회사명 (선택적)
  };
  token: string;    // 자동 로그인을 위한 인증 토큰
}

/**
 * 상세 회원가입 API 요청 형식
 * 회사 정보를 포함한 상세 회원가입 시 필요한 데이터 구조
 */
export interface SignUpRequest {
  email: string;             // 이메일 주소
  password: string;          // 비밀번호
  checkPassword: string;     // 비밀번호 확인용
  companyName: string;       // 회사명
  ceoName: string;           // 대표자명
  companyCode: string;       // 사업자등록번호
  companyPhoneNumber: string; // 회사 전화번호
  name: string;              // 사용자 이름
  phoneNumber: string;       // 사용자 전화번호
}

/**
 * 상세 회원가입 API 응답 형식
 * 상세 회원가입 성공 시 서버에서 반환하는 데이터 구조
 */
export interface SignUpResponse {
  success?: boolean;       // 성공 여부
  message?: string;        // 응답 메시지
  error?: string;          // 오류 메시지
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
  createdAt?: string;      // 계정 생성 일시
  updatedAt?: string;      // 계정 정보 업데이트 일시
  token?: string;          // 인증 토큰 (선택적)
}

/**
 * 로그인 기능
 * 
 * 이메일과 비밀번호로 사용자를 인증하고 토큰을 받아옵니다.
 * 
 * @param {LoginRequest} credentials - 이메일과 비밀번호 객체
 * @returns {Promise<LoginResponse>} 토큰과 사용자 정보가 포함된 응답
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const response = await login({ email: 'user@example.com', password: '1234' });
 *   console.log('로그인 성공:', response.token);
 * } catch (error) {
 *   console.error('로그인 실패:', error);
 * }
 * ```
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

    // 사용자 정보가 없는 경우 경고 로그
    if (!response.data.user) {
      console.warn('[API Auth] 로그인 응답에 사용자 정보가 없음 (토큰만 반환됨)');
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
 * 상세 회원가입 기능 (내부 사용)
 * 
 * 회사 정보를 포함한 상세 정보로 회원가입을 처리합니다.
 * 이 함수는 주로 signup 함수 내부에서 호출됩니다.
 * 
 * @param {SignUpRequest} credentials - 상세 회원가입 정보
 * @returns {Promise<SignUpResponse>} 회원가입 결과
 */
export const signupDetailed = async (credentials: SignUpRequest): Promise<SignUpResponse> => {
  try {
    console.log('[API Auth] 상세 회원가입 시도:', credentials.email);
    
    // API 요청 - POST /users/signup
    const response: AxiosResponse<SignUpResponse> = await axiosInstance.post(
      '/users/signup',
      credentials
    );
    
    console.log('[API Auth] 상세 회원가입 응답:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Auth] 상세 회원가입 오류:', error);
    throw error;
  }
};

/**
 * 회원가입 기능
 * 
 * 간단한 정보로 회원가입을 처리하고, 내부적으로 상세 정보를 기본값으로 채워 처리합니다.
 * 
 * @param {SignupRequest} userData - 기본 회원가입 정보 (이메일, 비밀번호, 이름, 회사명)
 * @returns {Promise<SignupResponse>} 회원가입 결과
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const response = await signup({
 *     email: 'user@example.com',
 *     password: 'secure123',
 *     name: '홍길동',
 *     company: '그린다이나믹스'
 *   });
 *   console.log('회원가입 성공:', response.user);
 * } catch (error) {
 *   console.error('회원가입 실패:', error);
 * }
 * ```
 */
export const signup = async (userData: SignupRequest): Promise<SignupResponse> => {
  try {
    console.log('[API Auth] 회원가입 시도:', userData.email);

    // 기본 정보를 상세 회원가입 형식으로 변환
    const detailedRequest: SignUpRequest = {
      email: userData.email,
      password: userData.password,
      checkPassword: userData.password, // 폼에서 이미 확인된 비밀번호
      name: userData.name,
      companyName: userData.company || '', // 회사명이 없으면 빈 문자열
      ceoName: '',                 // 기본값 - 빈 문자열
      companyCode: '',             // 기본값 - 빈 문자열
      companyPhoneNumber: '',      // 기본값 - 빈 문자열
      phoneNumber: ''              // 기본값 - 빈 문자열
    };

    // 상세 회원가입 API 호출
    const detailedResponse = await signupDetailed(detailedRequest);
    
    // 응답 형식 변환 (표준화)
    const standardResponse: SignupResponse = {
      user: {
        id: String(detailedResponse.id),  // 숫자를 문자열로 변환
        name: detailedResponse.name,
        email: detailedResponse.email,
        role: 'user',                      // 기본 권한: 'user'
        company: detailedResponse.companyName
      },
      token: detailedResponse.token || 'temporary-token' // 토큰이 없으면 임시 토큰 사용
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