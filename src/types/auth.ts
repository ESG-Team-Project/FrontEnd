/**
 * 인증 관련 타입 정의
 */

/**
 * 로그인 API 응답 형식
 * Swagger API 문서 기준으로 정의
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
    role?: string;
  };
}

/**
 * 로그인 API 요청 형식
 */
export interface LoginRequest {
  email: string; // 사용자 이메일
  password: string; // 비밀번호
}

/**
 * 회원가입 API 요청 형식
 */
export interface SignUpRequest {
  email: string; // 이메일 주소
  password: string; // 비밀번호
  checkPassword: string; // 비밀번호 확인용
  name: string; // 사용자 이름
  companyName: string; // 회사명
  ceoName: string; // 대표자명
  companyCode: string; // 사업자등록번호
  companyPhoneNumber: string; // 회사 전화번호
  phoneNumber: string; // 사용자 전화번호
}

/**
 * 회원가입 API 응답 형식
 */
export interface SignUpResponse {
  id: number; // 사용자 고유 ID (숫자)
  email: string; // 이메일 주소
  name: string; // 사용자 이름
  department?: string; // 부서 (선택적)
  position?: string; // 직위 (선택적)
  companyName: string; // 회사명
  ceoName: string; // 대표자명
  companyCode: string; // 사업자등록번호
  companyPhoneNumber: string; // 회사 전화번호
  phoneNumber: string; // 사용자 전화번호
  companyId: number; // 회사 ID
  createdAt: string; // 계정 생성 일시
  updatedAt: string; // 계정 정보 업데이트 일시
  token?: string; // 인증 토큰 (선택적)
}

/**
 * 토큰 검증 API 요청 형식
 */
export interface TokenVerificationRequest {
  token: string; // 검증할 인증 토큰
}

/**
 * 토큰 검증 API 응답 형식
 */
export interface TokenVerificationResponse {
  valid: boolean; // 토큰 유효성 여부
  userId?: number; // 토큰에서 추출한 사용자 ID (유효한 경우)
  email?: string; // 토큰에서 추출한 이메일 (유효한 경우)
  exp?: number; // 토큰 만료 시간 (Unix timestamp)
}

/**
 * 이메일 중복 체크 API 요청 형식
 */
export interface CheckEmailRequest {
  email: string; // 중복 체크할 이메일
}

/**
 * 이메일 중복 체크 API 응답 형식
 */
export interface CheckEmailResponse {
  available: boolean; // 사용 가능 여부
  message: string; // 결과 메시지
}
