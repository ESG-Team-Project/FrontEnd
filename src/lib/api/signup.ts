import axiosInstance from './axios';
import { AxiosResponse } from 'axios';

// 로그인 응답 타입 정의

interface SignUpResponse {
  success?: boolean;
  message?: string;
  error?: string;
  id: number;
  email: string;
  name: string;
  department?: string;
  position?: string;
  companyName: string;
  ceoName: string;
  companyCode: string;
  companyPhoneNumber: string;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

// 로그인 요청 타입 정의
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
