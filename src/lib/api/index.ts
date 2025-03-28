import axiosInstance from './axios';
import * as authService from './auth';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export { authService };

/**
 * GET 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {AxiosRequestConfig} config - axios 설정
 * @returns {Promise<AxiosResponse>} API 응답
 */
export const get = async <T = any>(
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
export const post = async <T = any>(
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
export const put = async <T = any>(
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
export const patch = async <T = any>(
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
export const del = async <T = any>(
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
};

export default apiService;
