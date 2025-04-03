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
