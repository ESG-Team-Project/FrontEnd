import type { AxiosResponse } from 'axios';
import { del, get, post, put } from '..';
import axiosInstance from '@/lib/api/core/axios';
import type { CompanyGRIData, CompanyGRICategoryValue, TimeSeriesDataPoint } from '@/types/companyGriData';
import { transformBackendDataToFrontend, transformFrontendDataToBackend, createInitialGriData } from './transformers';
import { logApiResponseDetails } from '../error';

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

// 캐시 방지를 위한 설정 객체 추가 (재사용 가능)
const noCacheConfig = {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  params: {
    '_': Date.now() // 타임스탬프를 쿼리에 추가
  }
};

// 캐시 방지 설정 생성 함수 (매 호출마다 새 타임스탬프 사용)
export const createNoCacheConfig = (additionalParams = {}) => {
  return {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    params: {
      ...additionalParams,
      '_': Date.now() // 타임스탬프를 쿼리에 추가
    }
  };
};

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
    // 캐싱 방지를 위한 설정 적용
    const config = createNoCacheConfig();
    
    const response = await axiosInstance.get('/company/gri', config);
    
    if (response.status !== 200) {
      throw new Error(`GRI 데이터 조회 실패: ${response.status}`);
    }
    
    // 응답 데이터 구조 로깅
    console.log('API 응답 구조: ', 
      Array.isArray(response.data) ? '배열' : 
      (response.data?.content ? 'Pagination 객체' : '객체'),
      '총 항목 수: ', 
      Array.isArray(response.data) ? response.data.length : 
      (response.data?.content ? response.data.content.length : '알 수 없음')
    );
    
    // 회사 ID 얻기
    let companyId = "current";
    
    // 응답 구조에 따라 추출 방식 변경
    if (Array.isArray(response.data) && response.data.length > 0) {
      // 배열인 경우 첫 번째 항목에서 companyId 추출
      if (response.data[0].companyId) {
        companyId = String(response.data[0].companyId);
      }
    } else if (response.data?.content && response.data.content.length > 0) {
      // 페이지네이션 객체인 경우 content 배열의 첫 번째 항목에서 추출
      if (response.data.content[0].companyId) {
        companyId = String(response.data.content[0].companyId);
      }
    } else if (response.data?.companyId) {
      // 단일 객체인 경우 직접 추출
      companyId = String(response.data.companyId);
    }
    
    console.log('GRI 데이터 변환에 사용할 회사 ID:', companyId);
    
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
    const backendDataArray = transformFrontendDataToBackend(data);
    
    // 백엔드가 객체 형식을 기대하므로 배열에서 객체로 변환
    const objectData: Record<string, BackendGRIDataItem> = {};
    backendDataArray.forEach(item => {
      const key = `${item.standardCode}-${item.disclosureCode}`;
      objectData[key] = item;
    });
    
    console.log('데이터 형식 변환:', {
      before: `배열 (${backendDataArray.length}개 항목)`,
      after: `객체 (${Object.keys(objectData).length}개 키)`
    });
    
    // API 호출 - 객체 형식으로 전송 (캐시 방지 헤더 추가)
    const response = await axiosInstance.put('/company/gri', objectData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`GRI 데이터 저장 실패: ${response.status}`);
    }
    
    // 저장 후 데이터 유효성 검증
    console.log('GRI 데이터 저장 성공, 데이터 일관성 검증 중...');
    try {
      // 새로운 데이터를 즉시 조회하여 저장된 내용 확인
      await getCompanyGriDataFormatted();
    } catch (validationError) {
      console.warn('저장 후 데이터 검증 실패:', validationError);
      // 검증 실패해도 저장은 성공했으므로 계속 진행
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
    const backendDataArray = transformFrontendDataToBackend(tempData);
    
    if (backendDataArray.length === 0) {
      console.warn(`변환할 데이터가 없습니다: ${categoryId}`);
      return false;
    }
    
    // 배열에서 객체로 변환
    const objectData: Record<string, BackendGRIDataItem> = {};
    backendDataArray.forEach(item => {
      const key = `${item.standardCode}-${item.disclosureCode}`;
      objectData[key] = item;
    });
    
    // 요청 데이터 로깅
    console.log('백엔드로 전송할 GRI 데이터:', JSON.stringify(objectData, null, 2));
    
    // API 호출 - 객체 형식으로 전송
    try {
      const response = await axiosInstance.put('/company/gri', objectData, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`GRI 카테고리 데이터 저장 실패: ${response.status}`);
      }
      
      console.log('GRI 데이터 저장 성공:', response.status, response.data);
      
      // 데이터 저장 후 일관성 검증
      console.log('저장 후 데이터 일관성 검증 중...');
      try {
        // 새 데이터 조회 (캐시 무시 강제)
        const refreshedData = await getCompanyGriDataFormatted();
        const updatedCategory = refreshedData.griValues[categoryId];
        
        // 간단한 일관성 검사
        if (!updatedCategory) {
          console.warn('저장된 카테고리를 다시 조회할 수 없습니다:', categoryId);
        } else {
          console.log('데이터 일관성 확인 완료:', categoryId);
        }
      } catch (validationError) {
        console.warn('저장 후 데이터 검증 오류:', validationError);
        // 검증 실패해도 저장은 성공했으므로 계속 진행
      }
      
      return true;
    } catch (apiError) {
      // 상세 오류 로깅
      logApiResponseDetails(apiError, `GRI 카테고리(${categoryId}) 데이터 저장`);
      throw apiError;
    }
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
    console.log(`페이지네이션 데이터 요청: page=${pageRequest.page}, size=${pageRequest.size}, sort=${pageRequest.sort || 'none'}`);
    
    // 캐시 방지 설정 생성
    const config = createNoCacheConfig({
      page: pageRequest.page,
      size: pageRequest.size,
      sort: pageRequest.sort
    });
    
    const response = await axiosInstance.get('/company/gri/paged', config);
    
    console.log(`페이지네이션 응답: 총 ${response.data.totalElements || 0}개 항목, ${response.data.totalPages || 0}개 페이지`);
    
    // 데이터 구조 확인
    if (!response.data.content) {
      console.warn('페이지네이션 응답에 content 배열이 없습니다:', response.data);
      // 기본 페이지네이션 객체 생성
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: pageRequest.size,
        number: pageRequest.page,
        first: true,
        last: true
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('페이지네이션 데이터 조회 오류:', error);
    // 오류 시 기본 페이지네이션 객체 반환
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: pageRequest.size,
      number: pageRequest.page,
      first: true,
      last: true
    };
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
