import axiosInstance from './axios';
import { getTokenFromAtom } from './axios';
import * as authService from './auth';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export { authService };

/**
 * 현재 로그인한 사용자 정보를 조회하는 함수
 * @returns {Promise<UserInfo>} 사용자 정보
 */
export const getCurrentUser = async () => {
  try {
    // 전체 URL을 로깅해 어떤 URL로 요청하는지 확인
    const baseUrl = axiosInstance.defaults.baseURL;
    const endpoint = '/users/me';
    console.log(`[API] 요청 예정: ${baseUrl}${endpoint}`);
    
    // 토큰 상태 확인 (Jotai 사용)
    const token = getTokenFromAtom();
    
    // 토큰이 없으면 오류 발생
    if (!token) {
      console.error('[API] 사용자 정보 조회 실패: 인증 토큰이 없습니다');
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    console.log(`[API] 현재 토큰: ${token.substring(0, 10)}...`);
    
    // 브라우저 환경에서 localStorage 직접 확인 (추가 디버깅)
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('auth');
        const legacyToken = localStorage.getItem('auth_token');
        console.log('[API] 로컬스토리지 확인 (auth):', authData ? '있음' : '없음');
        console.log('[API] 로컬스토리지 확인 (auth_token):', legacyToken ? '있음' : '없음');
      } catch (e) {
        console.error('[API] 로컬스토리지 접근 오류:', e);
      }
    }
    
    // API 요청 실행
    console.log('[API] 사용자 정보 요청 시작');
    const response = await axiosInstance.get(endpoint);
    console.log('[API] 사용자 정보 요청 성공:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] 사용자 정보 조회 실패:', error);
    
    // 에러 세부 정보 로깅
    if (error.response) {
      console.error(`[API] 오류 상태: ${error.response.status}`);
      console.error('[API] 오류 데이터:', error.response.data);
      
      // 401, 403 오류 시 추가 정보
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('[API] 인증 관련 오류: 토큰이 유효하지 않거나 권한이 부족합니다');
        // Jotai에서 토큰 확인
        const token = getTokenFromAtom();
        console.error('[API] 저장된 토큰:', token ? `${token.substring(0, 10)}...` : '없음');
      }
    } else if (error.request) {
      console.error('[API] 요청은 전송되었으나 응답이 없음:', error.request);
    } else {
      console.error(`[API] 오류 발생: ${error.message}`);
    }
    
    // 오류 전파
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '사용자 정보를 불러오는 중 오류가 발생했습니다.'
    );
  }
};

/**
 * GET 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {AxiosRequestConfig} config - axios 설정
 * @returns {Promise<AxiosResponse>} API 응답
 */
export const get = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.get<T>(url, config);
};

/**
 * POST 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {any} data - 요청 데이터
 * @param {AxiosRequestConfig} config - axios 설정
 * @returns {Promise<AxiosResponse>} API 응답
 */
export const post = async <T = unknown>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.post<T>(url, data, config);
};

/**
 * PUT 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {any} data - 요청 데이터
 * @param {AxiosRequestConfig} config - axios 설정
 * @returns {Promise<AxiosResponse>} API 응답
 */
export const put = async <T = unknown>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.put<T>(url, data, config);
};

/**
 * PATCH 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {any} data - 요청 데이터
 * @param {AxiosRequestConfig} config - axios 설정
 * @returns {Promise<AxiosResponse>} API 응답
 */
export const patch = async <T = unknown>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.patch<T>(url, data, config);
};

/**
 * DELETE 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {AxiosRequestConfig} config - axios 설정
 * @returns {Promise<AxiosResponse>} API 응답
 */
export const del = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.delete<T>(url, config);
};

// 기본 내보내기로 모든 메서드를 포함하는 객체 제공
const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  auth: authService,
  getCurrentUser
};

export default apiService;
