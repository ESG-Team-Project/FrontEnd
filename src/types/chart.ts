import type { ChartOptions, ChartDataset } from 'chart.js'; // Chart.js 타입 임포트

// chart.js 라이브러리에서 직접 지원하는 핵심 차트 타입 정의
export type ChartTypeCore = 'line' | 'bar' | 'pie';

// 애플리케이션에서 사용할 차트 타입 (area, donut 포함)
export type ChartType = ChartTypeCore | 'area' | 'donut';

// 차트 유형별 데이터 인터페이스
export interface BarChartData {
  categories: string[];
  values: number[];
  colors: string[];
}

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    name: string;
    values: number[];
  }>;
}

export interface PieChartData {
  items: Array<{
    name: string;
    value: string | number;
  }>;
}

export type ChartDataType = BarChartData | LineChartData | PieChartData | Record<string, unknown>;

export interface ChartData {
  id: string;
  title: string;
  type: ChartType; // 애플리케이션용 타입 사용
  description?: string;
  esg: string; // ESG 항목 식별자 추가
  labels?: string[]; // labels 속성 추가 (선택적)
  // datasets와 options는 chart.js 핵심 타입을 사용하도록 수정
  datasets?: ChartDataset<ChartTypeCore, number[]>[];
  options?: ChartOptions<ChartTypeCore>;
  colSpan?: number;
  createdAt?: Date; // 기존 createdAt 속성 (가정)
  updatedAt?: Date; // 기존 updatedAt 속성 (가정)
}

// 차트 생성을 위한 인터페이스
export interface ChartCreateInput {
  title: string;
  description?: string;
  type: ChartType;
  colSpan: 1 | 2 | 3 | 4;
  data: ChartDataType;
}
