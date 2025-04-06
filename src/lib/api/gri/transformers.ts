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
  
  // 숫자로 변환 시도, 실패시 기본값 사용
  let companyId: number;
  try {
    companyId = typeof frontendData.companyId === 'string' 
      ? Number.parseInt(frontendData.companyId, 10) 
      : (frontendData.companyId as unknown as number);
    
    // NaN 체크
    if (Number.isNaN(companyId)) {
      console.warn('CompanyId 숫자 변환 실패, 기본값 1 사용');
      companyId = 1; // 기본값
    }
  } catch (error) {
    console.warn('CompanyId 변환 오류, 기본값 1 사용:', error);
    companyId = 1; // 기본값
  }

  Object.values(frontendData.griValues).forEach(griValue => {
    if (!griValue || !griValue.categoryId) {
      console.warn('유효하지 않은 GRI 값 무시:', griValue);
      return;
    }
    
    const parts = griValue.categoryId.split('-');
    if (parts.length < 2) {
      console.warn(`유효하지 않은 카테고리 ID 형식: ${griValue.categoryId}`);
      return;
    }
    
    const standardCode = parts[0];
    const disclosureCode = parts[1];
    
    // null, undefined 등 유효하지 않은 값 검사
    if (!standardCode || !disclosureCode) {
      console.warn(`표준 코드 또는 공개 코드가 유효하지 않음: ${griValue.categoryId}`);
      return;
    }
    
    try {
      // 시계열 데이터인 경우
      if (griValue.dataType === 'timeSeries' && griValue.timeSeriesData && griValue.timeSeriesData.length > 0) {
        // 시계열 데이터는 문자열로 직렬화하여 전송
        const serializedData = JSON.stringify(griValue.timeSeriesData);
        const latestData = griValue.timeSeriesData.reduce(
          (latest, current) => (current.year > latest.year ? current : latest),
          griValue.timeSeriesData[0]
        );
        
        const backendItem: BackendGRIDataItem = {
          standardCode,
          disclosureCode,
          companyId,
          // 전체 시계열 데이터를 JSON 문자열로 저장
          disclosureValue: serializedData,
          // 최신 값을 numericValue에 저장
          numericValue: typeof latestData.value === 'number' ? latestData.value : null,
          unit: latestData.unit || ''
        };
        backendItems.push(backendItem);
      } 
      // 텍스트 데이터인 경우
      else if (griValue.dataType === 'text') {
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
      else if (griValue.dataType === 'numeric') {
        let numericValue: number | null = null;
        
        // 숫자 값이 있는 경우만 처리
        if (griValue.numericValue !== null && griValue.numericValue !== undefined) {
          // 문자열인 경우 변환 시도
          if (typeof griValue.numericValue === 'string') {
            numericValue = Number.parseFloat(griValue.numericValue);
            if (Number.isNaN(numericValue)) numericValue = null;
          } else {
            numericValue = griValue.numericValue;
          }
        }
        
        const backendItem: BackendGRIDataItem = {
          standardCode,
          disclosureCode,
          companyId,
          disclosureValue: numericValue !== null ? String(numericValue) : '0',
          numericValue,
          unit: griValue.numericUnit || ''
        };
        backendItems.push(backendItem);
      }
    } catch (error) {
      console.error(`GRI 항목 변환 오류 (${griValue.categoryId}):`, error);
      // 오류 있는 항목은 건너뛰고 계속 진행
    }
  });

  console.log(`변환된 백엔드 데이터: ${backendItems.length}개 항목`);
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