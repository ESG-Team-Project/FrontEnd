import type { ChartOptions, ChartDataset } from 'chart.js'; // Chart.js 타입 임포트

export type ChartType = 'line' | 'bar' | 'pie';

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
  type: ChartType | 'area' | 'donut';
  description?: string;
  labels?: string[]; // labels 속성 추가 (선택적)
  datasets?: ChartDataset<ChartType, number[]>[]; // datasets 타입을 ChartDataset 배열로 복원하되, 데이터 타입을 number[]로 명시
  options?: ChartOptions<ChartType>; // options 속성 추가 (선택적, Chart.js 타입 사용)
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