import { griCategories } from '@/data/griCategories';
import type { CompanyGRICategoryValue, CompanyGRIData, TimeSeriesDataPoint } from '@/types/companyGriData';
import axiosInstance from '@/lib/api/core/axios';

// 백엔드 API의 GRI 데이터 인터페이스
interface BackendGRIDataItem {
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

/**
 * 백엔드 GRI 데이터를 프론트엔드 형식으로 변환
 * @param backendData 백엔드 API로부터 받은 GRI 데이터 항목 배열
 * @param companyId 회사 ID
 * @returns 프론트엔드에서 사용하는 CompanyGRIData 형식
 */
function transformBackendDataToFrontend(backendData: BackendGRIDataItem[], companyId: string): CompanyGRIData {
  const griValues: Record<string, CompanyGRICategoryValue> = {};

  // 1. 먼저 빈 데이터 구조 초기화
  griCategories.forEach(cat => {
    griValues[cat.id] = {
      categoryId: cat.id,
      dataType: cat.defaultDataType as 'timeSeries' | 'text' | 'numeric' || 'text',
      timeSeriesData: cat.defaultDataType === 'timeSeries' ? [] : undefined,
      textValue: cat.defaultDataType === 'text' ? '' : null,
      numericValue: cat.defaultDataType === 'numeric' ? 0 : null
    };
  });

  // 2. 백엔드 데이터로 값 채우기
  backendData.forEach(item => {
    const categoryId = `${item.standardCode}-${item.disclosureCode}`;
    
    // 카테고리가 존재하는지 확인
    if (griValues[categoryId]) {
      const existingData = griValues[categoryId];
      
      // 시계열 데이터인 경우
      if (existingData.dataType === 'timeSeries') {
        if (!existingData.timeSeriesData) {
          existingData.timeSeriesData = [];
        }

        // 시계열 데이터 포맷 추출 시도
        try {
          // 시계열 데이터가 JSON 문자열로 저장되어 있는지 확인
          if (item.disclosureValue && item.disclosureValue.startsWith('[') && item.disclosureValue.endsWith(']')) {
            // JSON 문자열을 파싱하여 시계열 데이터로 변환
            const timeSeriesData = JSON.parse(item.disclosureValue) as TimeSeriesDataPoint[];
            existingData.timeSeriesData = timeSeriesData;
          } else {
            // 단일 값이고 특정 연도 정보가 있는 경우
            if (item.reportingPeriodStart && item.numericValue !== null) {
              const year = new Date(item.reportingPeriodStart).getFullYear();
              const newPoint: TimeSeriesDataPoint = {
                id: `${categoryId}-${year}`,
                year,
                value: item.numericValue,
                unit: item.unit || ''
              };
              existingData.timeSeriesData.push(newPoint);
            }
          }
        } catch (error) {
          console.error(`시계열 데이터 변환 오류 (${categoryId}):`, error);
        }
      } 
      // 텍스트 데이터인 경우
      else if (existingData.dataType === 'text') {
        existingData.textValue = item.disclosureValue || '';
      } 
      // 숫자 데이터인 경우
      else if (existingData.dataType === 'numeric') {
        existingData.numericValue = item.numericValue;
        if (item.unit) {
          existingData.numericUnit = item.unit;
        }
      }
    }
  });

  return {
    companyId,
    griValues
  };
}

/**
 * 프론트엔드 GRI 데이터를 백엔드 형식으로 변환
 * @param frontendData 프론트엔드의 CompanyGRIData 형식 데이터
 * @returns 백엔드 API에 전송할 형식의 데이터 배열
 */
function transformFrontendDataToBackend(frontendData: CompanyGRIData): BackendGRIDataItem[] {
  const backendItems: BackendGRIDataItem[] = [];
  const companyId = Number.parseInt(frontendData.companyId, 10);

  Object.values(frontendData.griValues).forEach(griValue => {
    const [standardCode, disclosureCode] = griValue.categoryId.split('-');
    
    // 시계열 데이터인 경우
    if (griValue.dataType === 'timeSeries' && griValue.timeSeriesData && griValue.timeSeriesData.length > 0) {
      const backendItem: BackendGRIDataItem = {
        standardCode,
        disclosureCode,
        companyId,
        timeSeriesData: griValue.timeSeriesData,
        numericValue: griValue.timeSeriesData[griValue.timeSeriesData.length - 1].value as number,
        disclosureValue: griValue.timeSeriesData[griValue.timeSeriesData.length - 1].value.toString()
      };
      backendItems.push(backendItem);
    } 
    // 텍스트 데이터인 경우
    else if (griValue.dataType === 'text' && griValue.textValue !== null) {
      const backendItem: BackendGRIDataItem = {
        standardCode,
        disclosureCode,
        companyId,
        disclosureValue: griValue.textValue || '',
        numericValue: null
      };
      backendItems.push(backendItem);
    } 
    // 숫자 데이터인 경우
    else if (griValue.dataType === 'numeric' && griValue.numericValue !== null) {
      const backendItem: BackendGRIDataItem = {
        standardCode,
        disclosureCode,
        companyId,
        disclosureValue: griValue.numericValue?.toString() || '0',
        numericValue: griValue.numericValue ?? null,
        unit: griValue.numericUnit
      };
      backendItems.push(backendItem);
    }
  });

  return backendItems;
}

// 회사의 GRI 데이터를 가져오는 함수
export async function getCompanyGriData(companyId: string): Promise<CompanyGRIData> {
  console.log(`Fetching GRI data for company: ${companyId}`);
  try {
    // 실제 API 호출 구현 - 수정된 엔드포인트 사용
    const response = await axiosInstance.get(`/api/company/${companyId}/gri`);
    
    if (response.status !== 200) {
      throw new Error(`GRI 데이터 조회 실패: ${response.status}`);
    }
    
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    return transformBackendDataToFrontend(response.data, companyId);
  } catch (error) {
    console.error('GRI 데이터 조회 중 오류:', error);
    
    // 더 상세한 오류 메시지 제공
    if (error.response) {
      // 서버 응답이 있는 오류
      console.error(`서버 오류 (${error.response.status}): ${error.response.data.message || '알 수 없는 오류'}`);
    } else if (error.request) {
      // 서버 응답이 없는 오류
      console.error('서버 응답 없음: 네트워크 오류 가능성');
    }
    
    // 오류가 발생하면 빈 데이터 구조 반환
    const initialData: Record<string, CompanyGRICategoryValue> = {};
    
    for (const cat of griCategories) {
      initialData[cat.id] = {
        categoryId: cat.id,
        dataType: cat.defaultDataType as 'timeSeries' | 'text' | 'numeric' || 'text',
        timeSeriesData: cat.defaultDataType === 'timeSeries' ? [] : undefined,
        textValue: cat.defaultDataType === 'text' ? '' : null,
        numericValue: cat.defaultDataType === 'numeric' ? 0 : null
      };
    }

    return {
      companyId,
      griValues: initialData,
    };
  }
}

// GRI 데이터 저장하는 함수
export async function saveCompanyGriData(data: CompanyGRIData): Promise<boolean> {
  console.log(`Saving GRI data for company: ${data.companyId}`);
  try {
    // 프론트엔드 데이터를 백엔드 형식으로 변환
    const backendData = transformFrontendDataToBackend(data);
    
    // 실제 API 호출 구현 - 수정된 엔드포인트와 메서드 사용
    const response = await axiosInstance.put(`/api/company/${data.companyId}/gri`, backendData);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`GRI 데이터 저장 실패: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('GRI 데이터 저장 중 오류:', error);
    throw error;
  }
}

// 개별 GRI 카테고리 데이터만 저장하는 함수
export async function saveSingleGriCategory(
  companyId: string,
  categoryId: string,
  categoryValue: CompanyGRICategoryValue
): Promise<boolean> {
  console.log(`Saving single GRI category ${categoryId} for company: ${companyId}`);
  try {
    // 임시 데이터 객체 생성
    const tempData: CompanyGRIData = {
      companyId,
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
    
    // 수정된 엔드포인트 사용
    const response = await axiosInstance.put(`/api/company/${companyId}/gri`, backendData);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`GRI 카테고리 데이터 저장 실패: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`GRI 카테고리(${categoryId}) 데이터 저장 중 오류:`, error);
    throw error;
  }
}

// 감사 로그 조회 함수 추가
export async function getAuditLogs(entityType: string, entityId: string): Promise<any[]> {
  try {
    const response = await axiosInstance.get(`/api/audit-logs`, {
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

// 페이지 요청 함수
export async function getGriDataPaginated(companyId: string, pageRequest: PageRequest): Promise<PageResponse<BackendGRIDataItem>> {
  try {
    const response = await axiosInstance.get(`/api/company/${companyId}/gri/paged`, {
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
