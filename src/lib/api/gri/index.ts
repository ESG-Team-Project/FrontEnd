import type { AxiosResponse } from 'axios';
import { del, get, post, put } from '..';

/**
 * GRI 데이터 항목 인터페이스
 */
export interface GriDataItem {
  id: number;
  standardCode: string;
  disclosureCode: string;
  disclosureTitle: string;
  disclosureValue: string;
  numericValue: number | null;
  unit: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  verificationStatus: string;
  verificationProvider: string;
  category: string;
  companyId: number;
  companyName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  valid: boolean;
}

/**
 * 모든 GRI 데이터 항목 가져오기
 *
 * 이 함수는 서버에 저장된 모든 GRI 데이터 항목을 가져옵니다.
 *
 * @returns {Promise<GriDataItem[]>} GRI 데이터 항목 배열
 *
 * 사용 예시:
 * ```
 * const griItems = await getAllGriData();
 * console.log('모든 GRI 데이터:', griItems);
 * ```
 */
export const getAllGriData = async (): Promise<GriDataItem[]> => {
  try {
    const response: AxiosResponse<GriDataItem[]> = await get('/api/gri');
    return response.data;
  } catch (error) {
    console.error('[API GRI] 모든 GRI 데이터 가져오기 오류:', error);
    throw error;
  }
};

/**
 * 특정 회사의 GRI 데이터 항목 가져오기
 *
 * 이 함수는 특정 회사 ID를 기반으로 GRI 데이터 항목을 가져옵니다.
 *
 * @param {number} companyId - 회사 ID
 * @returns {Promise<GriDataItem[]>} 회사의 GRI 데이터 항목 배열
 *
 * 사용 예시:
 * ```
 * const companyGriItems = await getCompanyGriData(123);
 * console.log('회사의 GRI 데이터:', companyGriItems);
 * ```
 */
export const getCompanyGriData = async (companyId: number): Promise<GriDataItem[]> => {
  try {
    const response: AxiosResponse<GriDataItem[]> = await get(`/api/gri/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error(`[API GRI] 회사(ID: ${companyId})의 GRI 데이터 가져오기 오류:`, error);
    throw error;
  }
};

/**
 * GRI 데이터 항목 저장/업데이트
 *
 * 이 함수는 GRI 데이터 항목을 저장하거나 업데이트합니다.
 *
 * @param {GriDataItem | GriDataItem[]} data - 저장할 GRI 데이터 항목 또는 항목 배열
 * @returns {Promise<boolean>} 성공 여부
 *
 * 사용 예시:
 * ```
 * const success = await saveGriData(griItem);
 * console.log('GRI 데이터 저장 성공:', success);
 * ```
 */
export const saveGriData = async (data: GriDataItem | GriDataItem[]): Promise<boolean> => {
  try {
    if (Array.isArray(data)) {
      // 여러 항목 저장
      const response = await post('/api/gri/batch', data);
      return response.status === 200 || response.status === 201;
    }

    // 단일 항목 저장
    if (data.id) {
      // id가 있으면 기존 항목 업데이트
      const response = await put(`/api/gri/${data.id}`, data);
      return response.status === 200;
    }

    // id가 없으면 새 항목 생성
    const response = await post('/api/gri', data);
    return response.status === 201;
  } catch (error) {
    console.error('[API GRI] GRI 데이터 저장 오류:', error);
    throw error;
  }
};

/**
 * GRI 데이터 항목 삭제
 *
 * 이 함수는 특정 ID의 GRI 데이터 항목을 삭제합니다.
 *
 * @param {number} id - 삭제할 GRI 항목 ID
 * @returns {Promise<boolean>} 성공 여부
 *
 * 사용 예시:
 * ```
 * const success = await deleteGriData(456);
 * console.log('GRI 데이터 삭제 성공:', success);
 * ```
 */
export const deleteGriData = async (id: number): Promise<boolean> => {
  try {
    const response = await del(`/api/gri/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error(`[API GRI] GRI 데이터(ID: ${id}) 삭제 오류:`, error);
    throw error;
  }
};

// GRI 서비스 객체
const griService = {
  getAllGriData,
  getCompanyGriData,
  saveGriData,
  deleteGriData,
};

export default griService;
