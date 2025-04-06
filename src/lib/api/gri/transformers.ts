import { griCategories } from '@/data/griCategories';
import type { CompanyGRICategoryValue, CompanyGRIData, TimeSeriesDataPoint } from '@/types/companyGriData';
import type { BackendGRIDataItem } from './index';

/**
 * 백엔드 GRI 데이터를 프론트엔드 형식으로 변환
 * @param backendData 백엔드 API로부터 받은 GRI 데이터 항목 배열 또는 객체
 * @param companyId 회사 ID
 * @returns 프론트엔드에서 사용하는 CompanyGRIData 형식
 */
export function transformBackendDataToFrontend(backendData: any, companyId: string): CompanyGRIData {
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
  // API 응답 형식 변경에 따른 처리
  const dataArray = Array.isArray(backendData) ? backendData : 
                  (backendData && backendData.content ? backendData.content : 
                  (backendData && typeof backendData === 'object' ? [backendData] : []));
  
  console.log('GRI 데이터 변환 시작: ', dataArray.length, '개 항목');
  
  dataArray.forEach(item => {
    if (!item || !item.standardCode || !item.disclosureCode) {
      console.warn('GRI 데이터 항목 처리 중 누락된 정보: ', item);
      return;
    }
    
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
    } else {
      console.warn(`카테고리 ID가 매칭되지 않음: ${categoryId}`);
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
export function transformFrontendDataToBackend(frontendData: CompanyGRIData): BackendGRIDataItem[] {
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

/**
 * 초기 빈 GRI 데이터 구조 생성
 * @param companyId 회사 ID
 * @returns 빈 GRI 데이터 구조
 */
export function createInitialGriData(companyId: string): CompanyGRIData {
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