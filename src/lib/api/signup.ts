import axiosInstance from './axios';
import { AxiosResponse } from 'axios';

// 회원가입 응답 타입 정의
interface SignUpResponse {
  id: number;
  email: string;
  name: string;
  department: string | null;
  position: string | null;
  companyName: string;
  ceoName: string;
  companyCode: string;
  companyPhoneNumber: string;
  phoneNumber: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

// 회원가입 요청 타입 정의
interface SignUpRequest {
  email: string;
  password: string;
  checkPassword: string;
  companyName: string;
  ceoName: string;
  companyCode: string;
  companyPhoneNumber: string;
  name: string;
  phoneNumber: string;
}

/**
 * 회원가입 함수
 * @param {SignUpRequest} credentials - 회원가입 자격 증명
 * @returns {Promise<SignUpResponse>} 회원가입 응답
 */
export const signup = async (credentials: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response: AxiosResponse<SignUpResponse> = await axiosInstance.post(
      '/users/signup',
      credentials
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
