/**
 * 사용자 정보 타입 정의
 */
export interface UserInfo {
  id: number;
  email: string;
  name: string;
  department?: string;
  position?: string;
  companyName?: string;
  ceoName?: string;
  companyCode?: string;
  companyPhoneNumber?: string;
  phoneNumber?: string;
  companyId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 사용자 정보 업데이트 요청 타입
 * 사용자 프로필 정보 수정 시 사용되는 데이터 구조
 */
export interface UserUpdateRequest {
  name?: string;      // 사용자 이름 (선택적)
  email?: string;     // 이메일 주소 (선택적)
  phone?: string;     // 전화번호 (선택적)
  password?: string;  // 새 비밀번호 (선택적)
}

/**
 * 비밀번호 변경 요청 타입
 */
export interface PasswordChangeRequest {
  currentPassword: string;  // 현재 비밀번호
  newPassword: string;      // 새 비밀번호
}

/**
 * 비밀번호 변경 응답 타입
 */
export interface PasswordChangeResponse {
  success: boolean;    // 성공 여부
  message: string;     // 결과 메시지
}

/**
 * 프로필 이미지 업로드 응답 타입
 */
export interface ProfileImageResponse {
  imageUrl: string;    // 업로드된 이미지 URL
}
