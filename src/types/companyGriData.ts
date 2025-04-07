// src/types/companyGriData.ts

// 시계열 데이터 포인트 구조 정의
export interface TimeSeriesDataPoint {
  id: string; // 각 데이터 포인트의 고유 ID (예: UUID, 또는 year+quarter+month 조합)
  year: number;
  quarter?: 1 | 2 | 3 | 4 | null; // 선택적 분기
  month?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | null; // 선택적 월
  value: string | number; // 해당 시점의 데이터 값
  unit?: string; // 단위 (옵션)
  notes?: string; // 비고 (옵션)
}

// 각 GRI 카테고리에 대한 데이터 값 구조 정의
export interface CompanyGRICategoryValue {
  categoryId: string; // GRI 카테고리 ID (예: '305-1')
  dataType: 'timeSeries' | 'text'; // 데이터 유형 구분 (단순 수치 데이터 타입 제거)
  timeSeriesData?: TimeSeriesDataPoint[]; // 시계열 데이터 배열 (dataType이 'timeSeries'일 때 사용)
  textValue?: string | null; // 텍스트 데이터 (dataType이 'text'일 때 사용)
}

// 회사 전체의 GRI 데이터 구조
export interface CompanyGRIData {
  companyId: string;
  // key: categoryId, value: 해당 카테고리의 데이터 값 객체
  griValues: Record<string, CompanyGRICategoryValue>;
}
