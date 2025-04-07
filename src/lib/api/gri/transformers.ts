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
      dataType: cat.defaultDataType as 'timeSeries' | 'text' || 'text',
      timeSeriesData: cat.defaultDataType === 'timeSeries' ? [] : undefined,
      textValue: cat.defaultDataType === 'text' ? '' : null,
    };
  });

  // 2. 백엔드 데이터로 값 채우기
  // 객체 형식의 데이터 직접 처리 ({"102-1": {...}, "102-2": {...}} 형식)
  if (backendData && typeof backendData === 'object' && !Array.isArray(backendData) && 
      Object.keys(backendData).some(key => key.includes('-'))) {
    
    // 각 키(GRI 코드)에 대해 처리
    Object.keys(backendData).forEach(categoryId => {
      // GRI 카테고리 ID가 유효하면 처리
      if (griValues[categoryId]) {
        const item = backendData[categoryId];
        const existingData = griValues[categoryId];
        
        // 데이터 타입에 맞게 처리
        if (existingData.dataType === 'text') {
          existingData.textValue = item.disclosureValue || '';
        } 
        else if (existingData.dataType === 'timeSeries') {
          if (!existingData.timeSeriesData) {
            existingData.timeSeriesData = [];
          }

          try {
            // 시계열 데이터가 JSON 문자열로 저장되어 있는지 확인
            if (item.disclosureValue && item.disclosureValue.startsWith('[') && item.disclosureValue.endsWith(']')) {
              try {
                // JSON 문자열을 파싱하여 시계열 데이터로 변환
                const timeSeriesData = JSON.parse(item.disclosureValue) as TimeSeriesDataPoint[];
                
                if (Array.isArray(timeSeriesData)) {
                  existingData.timeSeriesData = timeSeriesData;
                }
              } catch (parseError) {
                // JSON 파싱 오류 무시
              }
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
            // 시계열 데이터 변환 오류 무시
          }
        }
      }
    });
  }
  // 기존 배열 처리 로직
  else {
    const dataArray = Array.isArray(backendData) ? backendData : 
                    (backendData && backendData.content ? backendData.content : 
                    (backendData && typeof backendData === 'object' ? [backendData] : []));
    
    // 처리된 카테고리 ID 추적 (중복 감지용)
    const processedCategories = new Set<string>();
    
    dataArray.forEach((item: any) => {
      if (!item || !item.standardCode || !item.disclosureCode) {
        return;
      }
      
      const categoryId = `${item.standardCode}-${item.disclosureCode}`;
      
      // 이미 처리된 카테고리인지 확인 (중복 감지)
      if (processedCategories.has(categoryId)) {
        return;
      }
      
      processedCategories.add(categoryId);
      
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
              try {
                // JSON 문자열을 파싱하여 시계열 데이터로 변환
                const timeSeriesData = JSON.parse(item.disclosureValue) as TimeSeriesDataPoint[];
                
                if (Array.isArray(timeSeriesData)) {
                  existingData.timeSeriesData = timeSeriesData;
                }
              } catch (parseError) {
                // JSON 파싱 오류 무시
              }
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
            // 시계열 데이터 변환 오류 무시
          }
        } 
        // 텍스트 데이터인 경우
        else if (existingData.dataType === 'text') {
          existingData.textValue = item.disclosureValue || '';
        }
      }
    });
  }

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
      companyId = 1; // 기본값
    }
  } catch (error) {
    companyId = 1; // 기본값
  }

  Object.values(frontendData.griValues).forEach(griValue => {
    if (!griValue || !griValue.categoryId) {
      return;
    }
    
    const parts = griValue.categoryId.split('-');
    if (parts.length < 2) {
      return;
    }
    
    const standardCode = parts[0];
    const disclosureCode = parts[1];
    
    // null, undefined 등 유효하지 않은 값 검사
    if (!standardCode || !disclosureCode) {
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
    } catch (error) {
      // 오류 있는 항목은 건너뛰고 계속 진행
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
      dataType: cat.defaultDataType as 'timeSeries' | 'text' || 'text',
      timeSeriesData: cat.defaultDataType === 'timeSeries' ? [] : undefined,
      textValue: cat.defaultDataType === 'text' ? '' : null,
    };
  }

  return {
    companyId,
    griValues: initialData,
  };
} 