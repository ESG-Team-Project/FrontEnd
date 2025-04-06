import type { AxiosResponse } from 'axios';
import { del, get, post, put } from '..';
import axiosInstance from '@/lib/api/core/axios';
import type { CompanyGRIData, CompanyGRICategoryValue, TimeSeriesDataPoint } from '@/types/companyGriData';
import { transformBackendDataToFrontend, transformFrontendDataToBackend, createInitialGriData } from './transformers';

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
  timeSeriesData?: TimeSeriesDataPoint[];
  auditLog?: boolean;
}

// 백엔드 API의 GRI 데이터 인터페이스
export interface BackendGRIDataItem {
  id?: number;
  standardCode: string;
  disclosureCode: string;
  disclosureTitle?: string;
  disclosureValue: string;
  numericValue: number | null;
  unit?: string;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  verificationStatus?: string;
  verificationProvider?: string;
  category?: string;
  companyId: number;
  companyName?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  valid?: boolean;
  timeSeriesData?: TimeSeriesDataPoint[];
  auditLog?: boolean;
}

// 페이지네이션 인터페이스 정의
export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}

// 페이지 응답 인터페이스
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
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
    const response: AxiosResponse<GriDataItem[]> = await get('/gri');
    return response.data;
  } catch (error) {
    console.error('[API GRI] 모든 GRI 데이터 가져오기 오류:', error);
    throw error;
  }
};

/**
 * 특정 회사의 GRI 데이터 항목 가져오기
 *
 * 이 함수는 로그인한 사용자의 회사 GRI 데이터 항목을 가져옵니다.
 *
 * @returns {Promise<GriDataItem[]>} 회사의 GRI 데이터 항목 배열
 *
 * 사용 예시:
 * ```
 * const companyGriItems = await getCompanyGriData();
 * console.log('회사의 GRI 데이터:', companyGriItems);
 * ```
 */
export const getCompanyGriData = async (): Promise<GriDataItem[]> => {
  try {
    const response: AxiosResponse<GriDataItem[]> = await get('/company/gri');
    return response.data;
  } catch (error) {
    console.error('[API GRI] 회사의 GRI 데이터 가져오기 오류:', error);
    throw error;
  }
};

/**
 * 회사의 GRI 데이터를 가져와 프론트엔드 형식으로 변환
 *
 * @returns 프론트엔드에서 사용하는 CompanyGRIData 형식
 */
export async function getCompanyGriDataFormatted(): Promise<CompanyGRIData> {
  console.log('Fetching GRI data for company');
  try {
    const response = await axiosInstance.get('/company/gri');
    
    if (response.status !== 200) {
      throw new Error(`GRI 데이터 조회 실패: ${response.status}`);
    }
    
    // 회사 ID 얻기 (응답에서 추출 또는 인증 상태에서 가져오기)
    // 여기서는 응답의 첫 번째 아이템에서 회사 ID를 얻는다고 가정
    let companyId = "current";
    if (response.data && response.data.length > 0 && response.data[0].companyId) {
      companyId = response.data[0].companyId.toString();
    }
    
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    return transformBackendDataToFrontend(response.data, companyId);
  } catch (error) {
    console.error('GRI 데이터 조회 중 오류:', error);
    
    // 더 상세한 오류 메시지 제공
    const err = error as any;
    if (err.response) {
      // 서버 응답이 있는 오류
      console.error(`서버 오류 (${err.response.status}): ${err.response.data?.message || '알 수 없는 오류'}`);
    } else if (err.request) {
      // 서버 응답이 없는 오류
      console.error('서버 응답 없음: 네트워크 오류 가능성');
    }
    
    // 오류 발생 시 초기 데이터 생성하여 반환
    return createInitialGriData("current");
  }
}

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
      const response = await post('/gri/batch', data);
      return response.status === 200 || response.status === 201;
    }

    // 단일 항목 저장
    if (data.id) {
      // id가 있으면 기존 항목 업데이트
      const response = await put(`/gri/${data.id}`, data);
      return response.status === 200;
    }

    // id가 없으면 새 항목 생성
    const response = await post('/gri', data);
    return response.status === 201;
  } catch (error) {
    console.error('[API GRI] GRI 데이터 저장 오류:', error);
    throw error;
  }
};

/**
 * 회사 GRI 데이터 저장하는 함수 (구조화된 형식)
 */
export async function saveCompanyGriDataFormatted(data: CompanyGRIData): Promise<boolean> {
  console.log('Saving GRI data for company');
  try {
    // 프론트엔드 데이터를 백엔드 형식으로 변환
    const backendData = transformFrontendDataToBackend(data);
    
    // API 호출
    const response = await axiosInstance.put('/company/gri', backendData);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`GRI 데이터 저장 실패: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('GRI 데이터 저장 중 오류:', error);
    throw error;
  }
}

/**
 * 개별 GRI 카테고리 데이터만 저장하는 함수
 */
export async function saveSingleGriCategory(
  categoryId: string,
  categoryValue: CompanyGRICategoryValue
): Promise<boolean> {
  console.log(`Saving single GRI category ${categoryId}`);
  try {
    // 임시 데이터 객체 생성
    const tempData: CompanyGRIData = {
      companyId: "current", // 현재 사용자 회사 ID (백엔드에서 토큰으로 결정)
      griValues: {
        [categoryId]: categoryValue
      }
    };
    
    // 변환 함수 사용
    const backendData = transformFrontendDataToBackend(tempData);
    
    if (backendData.length === 0) {
      console.warn(`변환할 데이터가 없습니다: ${categoryId}`);
      return false;
    }
    
    // API 호출
    const response = await axiosInstance.put('/company/gri', backendData);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`GRI 카테고리 데이터 저장 실패: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`GRI 카테고리(${categoryId}) 데이터 저장 중 오류:`, error);
    throw error;
  }
}

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
    const response = await del(`/gri/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error(`[API GRI] GRI 데이터(ID: ${id}) 삭제 오류:`, error);
    throw error;
  }
};

/**
 * 감사 로그 조회 함수
 */
export async function getAuditLogs(entityType: string, entityId: string): Promise<any[]> {
  try {
    const response = await axiosInstance.get('/audit-logs', {
      params: {
        entityType,
        entityId
      }
    });
    return response.data;
  } catch (error) {
    console.error('감사 로그 조회 오류:', error);
    return [];
  }
}

/**
 * 페이지네이션이 적용된 GRI 데이터 조회
 */
export async function getGriDataPaginated(
  pageRequest: PageRequest
): Promise<PageResponse<BackendGRIDataItem>> {
  try {
    const response = await axiosInstance.get('/company/gri/paged', {
      params: {
        page: pageRequest.page,
        size: pageRequest.size,
        sort: pageRequest.sort
      }
    });
    return response.data;
  } catch (error) {
    console.error('페이지네이션 데이터 조회 오류:', error);
    throw error;
  }
}

// GRI 서비스 객체
const griService = {
  getAllGriData,
  getCompanyGriData,
  getCompanyGriDataFormatted,
  saveGriData,
  saveCompanyGriDataFormatted,
  saveSingleGriCategory,
  deleteGriData,
  getAuditLogs,
  getGriDataPaginated
};

export default griService;
