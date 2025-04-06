import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as authService from './auth';
import * as chartService from './chart';
import axiosInstance from './core/axios';
import { getTokenFromAtom } from './core/axios';
import * as fileService from './file';
import * as griService from './gri';
import * as userService from './user';

// 타입 재export
export type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
} from '@/types/auth';

export type {
  UserInfo,
  UserUpdateRequest,
  PasswordChangeRequest,
  PasswordChangeResponse,
  ProfileImageResponse,
} from '@/types/user';

export type { FileUploadResponse } from '@/types/file';

export type { ChartData } from '@/types/chart';

export type { GriDataItem } from './gri';

// 서비스 모듈 재export
export { authService, chartService, fileService, userService, griService };

// 각 서비스 모듈 개별 export
export * from './auth';
export * from './chart';
export * from './file';
export * from './user';
export * from './gri';

// 직접 export 부분 제거
export const getCurrentUser = userService.getCurrentUser;

/**
 * GET 요청을 보내는 함수
 *
 * @param {string} url - API 엔드포인트 주소 (예: '/users/123')
 * @param {AxiosRequestConfig} config - 추가 설정 (헤더, 타임아웃 등)
 * @returns {Promise<AxiosResponse<T>>} API 응답 데이터
 *
 * 사용 예시:
 * ```
 * const { data } = await get('/users/me');
 * console.log('내 정보:', data);
 * ```
 */
export const get = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.get<T>(url, config);
};

/**
 * POST 요청을 보내는 함수 (데이터 생성)
 *
 * @param {string} url - API 엔드포인트 주소
 * @param {any} data - 서버로 보낼 데이터 객체
 * @param {AxiosRequestConfig} config - 추가 설정
 * @returns {Promise<AxiosResponse<T>>} API 응답 데이터
 *
 * 사용 예시:
 * ```
 * const { data } = await post('/users', { name: '홍길동', email: 'hong@example.com' });
 * console.log('생성된 사용자:', data);
 * ```
 */
export const post = async <T = unknown>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.post<T>(url, data, config);
};

/**
 * PUT 요청을 보내는 함수 (데이터 전체 수정)
 *
 * @param {string} url - API 엔드포인트 주소
 * @param {any} data - 서버로 보낼 데이터 객체
 * @param {AxiosRequestConfig} config - 추가 설정
 * @returns {Promise<AxiosResponse<T>>} API 응답 데이터
 *
 * 사용 예시:
 * ```
 * const { data } = await put('/users/123', { name: '홍길동', email: 'hong@example.com' });
 * console.log('업데이트된 사용자:', data);
 * ```
 */
export const put = async <T = unknown>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.put<T>(url, data, config);
};

/**
 * PATCH 요청을 보내는 함수 (데이터 일부 수정)
 *
 * @param {string} url - API 엔드포인트 주소
 * @param {any} data - 서버로 보낼 데이터 객체 (변경할 필드만 포함)
 * @param {AxiosRequestConfig} config - 추가 설정
 * @returns {Promise<AxiosResponse<T>>} API 응답 데이터
 *
 * 사용 예시:
 * ```
 * const { data } = await patch('/users/123', { name: '홍길동' }); // 이름만 변경
 * console.log('부분 업데이트된 사용자:', data);
 * ```
 */
export const patch = async <T = unknown>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.patch<T>(url, data, config);
};

/**
 * DELETE 요청을 보내는 함수 (데이터 삭제)
 *
 * @param {string} url - API 엔드포인트 주소
 * @param {AxiosRequestConfig} config - 추가 설정
 * @returns {Promise<AxiosResponse<T>>} API 응답 데이터
 *
 * 사용 예시:
 * ```
 * await del('/users/123');
 * console.log('사용자 삭제 완료');
 * ```
 */
export const del = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.delete<T>(url, config);
};

/**
 * 모든 API 서비스와 HTTP 메서드를 포함하는 객체
 *
 * 컴포넌트에서 사용 예시:
 * ```
 * import api from '@/lib/api';
 *
 * // 인증 관련 API 호출
 * const loginResponse = await api.auth.login({ email, password });
 *
 * // 사용자 관련 API 호출
 * const userInfo = await api.user.updateUser({ name: '홍길동' });
 *
 * // 일반 HTTP 메서드 사용
 * const data = await api.get('/some/endpoint');
 * ```
 */
const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  auth: authService,
  chart: chartService,
  file: fileService,
  user: userService,
  gri: griService,
};

export default apiService;
