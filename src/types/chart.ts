import type { ChartDataset, ChartOptions } from 'chart.js'; // Chart.js 타입 임포트

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

// API 차트 데이터 아이템 인터페이스
export interface ApiChartDataItem {
  label: string;
  value: number;
  unit?: string;
  timestamp?: string;
}

// API 차트 스타일 인터페이스
export interface ApiChartStyle {
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  [key: string]: unknown;
}

// 서버에서 받는 원본 차트 데이터 (API 응답 형식)
export interface ApiChartData {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  indicator: string;
  chartGrid: number;
  data: ApiChartDataItem[];
  chartType: string;
  style?: ApiChartStyle;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// 애플리케이션에서 사용하는 통합 차트 데이터 형식
export interface ChartData {
  id: string;
  userId?: number;
  title: string;
  chartType: ChartType; // 모든 곳에서 chartType으로 통일
  description?: string;
  category: string; // ESG 카테고리
  indicator?: string;
  labels?: string[]; // x축 라벨 배열
  datasets: ChartDataset<ChartTypeCore, number[]>[]; // Chart.js 데이터셋
  options?: ChartOptions<ChartTypeCore>; // Chart.js 옵션
  colSpan: number; // 그리드 크기 (1-4)
  esg?: string; // ESG 항목 식별자 추가
  data?: Array<{
    label: string; // 데이터 항목의 레이블
    key: number; // 데이터 값
    unit?: string; // 데이터 단위 (선택적)
  }>; // 데이터 배열 (선택적)
  chartGrid?: number;
  createdAt?: Date; // 생성 날짜
  updatedAt?: Date; // 업데이트 날짜
}

// 차트 생성을 위한 인터페이스
export interface ChartCreateInput {
  title: string;
  description?: string;
  chartType: ChartType;
  category: string;
  colSpan: 1 | 2 | 3 | 4;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

// API 데이터를 애플리케이션 차트 데이터로 변환하는 유틸리티 함수
export function transformApiToChartData(apiData: ApiChartData): ChartData {
  // 레이블과 값 추출
  const labels = apiData.data.map((item) => item.label);
  const values = apiData.data.map((item) => item.value);

  // 스타일 가져오기 (있는 경우)
  const backgroundColor =
    apiData.style?.backgroundColor ||
    (apiData.chartType.toLowerCase() === 'pie'
      ? values.map(() => getRandomColor())
      : getRandomColor());

  const borderColor =
    apiData.style?.borderColor ||
    (apiData.chartType.toLowerCase() === 'line' || apiData.chartType.toLowerCase() === 'area'
      ? getRandomColor()
      : values.map(() => getRandomColor()));

  const borderWidth = apiData.style?.borderWidth ? Number(apiData.style.borderWidth) : 1;
  const tension =
    apiData.style?.tension ||
    (apiData.chartType.toLowerCase() === 'line' || apiData.chartType.toLowerCase() === 'area'
      ? 0.1
      : undefined);

  return {
    id: String(apiData.id),
    title: apiData.title,
    chartType: apiData.chartType.toLowerCase() as ChartType,
    description: apiData.description,
    category: apiData.category.toLowerCase(),
    labels,
    datasets: [
      {
        label: apiData.indicator,
        data: values,
        backgroundColor,
        borderColor,
        borderWidth,
        fill: apiData.chartType.toLowerCase() === 'area',
        tension,
      },
    ],
    options: getDefaultOptions(apiData.chartType.toLowerCase() as ChartType),
    colSpan: apiData.chartGrid || 1,
  };
}

// 랜덤 색상 생성 함수
function getRandomColor(): string {
  const colors = [
    '#3498db',
    '#e74c3c',
    '#2ecc71',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
    '#34495e',
    '#d35400',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 차트 타입별 기본 옵션 얻기
function getDefaultOptions(chartType: ChartType): ChartOptions<ChartTypeCore> {
  switch (chartType) {
    case 'bar':
      return {
        indexAxis: 'x',
        plugins: { legend: { display: true } },
        scales: { x: { beginAtZero: true }, y: { beginAtZero: true } },
      };
    case 'pie':
    case 'donut':
      return {
        plugins: {
          legend: { position: 'top' },
          tooltip: { enabled: true },
        },
      };
    case 'line':
    case 'area':
      return {
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } },
      };
    default:
      return {
        plugins: { legend: { display: true } },
      };
  }
}
