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
      // 방법 1: 시계열 데이터를 JSON 문자열로 저장
      const backendItem: BackendGRIDataItem = {
        standardCode,
        disclosureCode,
        companyId,
        disclosureValue: JSON.stringify(griValue.timeSeriesData),
        numericValue: null
      };
      backendItems.push(backendItem);

      // 방법 2: 각 시계열 데이터 포인트를 개별 항목으로 저장
      // 이 방법은 백엔드가 시계열 데이터를 직접 지원하지 않을 때 사용
      /*
      griValue.timeSeriesData.forEach(point => {
        const reportingPeriodStart = new Date(point.year, 0, 1).toISOString();
        const reportingPeriodEnd = new Date(point.year, 11, 31).toISOString();
        
        const backendItem: BackendGRIDataItem = {
          standardCode,
          disclosureCode,
          companyId,
          disclosureValue: point.value.toString(),
          numericValue: typeof point.value === 'number' ? point.value : null,
          unit: point.unit,
          reportingPeriodStart,
          reportingPeriodEnd
        };
        backendItems.push(backendItem);
      });
      */
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
    // 실제 API 호출 구현
    const response = await axiosInstance.get(`/api/gri/company/${companyId}`);
    
    if (response.status !== 200) {
      throw new Error(`GRI 데이터 조회 실패: ${response.status}`);
    }
    
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    return transformBackendDataToFrontend(response.data, companyId);
  } catch (error) {
    console.error('GRI 데이터 조회 중 오류:', error);
    
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
    
    // 실제 API 호출 구현
    const response = await axiosInstance.post(`/api/gri/company/${data.companyId}/batch`, backendData);
    
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
    
    // 단일 항목 또는 배치 요청 결정
    const response = await axiosInstance.post(`/api/gri/company/${companyId}/batch`, backendData);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`GRI 카테고리 데이터 저장 실패: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`GRI 카테고리(${categoryId}) 데이터 저장 중 오류:`, error);
    throw error;
  }
}
