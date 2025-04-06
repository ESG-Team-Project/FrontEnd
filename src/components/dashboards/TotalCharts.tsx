import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  Activity,
  FileText,
} from 'lucide-react';
import type { ChartType, ChartData } from '@/types/chart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData as ChartJSData,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Chart.js에 필요한 모든 요소 등록 (컴포넌트 로드 시 한 번만 실행되도록)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TotalChartsProps {
  chartData: ChartData;
}

export default function TotalCharts({ chartData }: TotalChartsProps) {
  // 차트 아이콘 선택
  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
      case 'line':
        return <LineChart className="w-5 h-5 mr-2" />;
      case 'bar':
        return <BarChart className="w-5 h-5 mr-2" />;
      case 'area':
        return <AreaChart className="w-5 h-5 mr-2" />;
      case 'pie':
      case 'donut':
        return <PieChart className="w-5 h-5 mr-2" />;
      default:
        return <Activity className="w-5 h-5 mr-2" />;
    }
  };

  // 차트 렌더링 함수
  const renderChartContent = () => {
    // 기본 옵션 설정
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
    };

    const chartDataProp = {
      labels: chartData.labels || [],
      datasets: chartData.datasets || [],
    };

    const chartContainerStyle = { height: '250px', width: '100%' };

    try {
      switch (chartData.chartType) {
        case 'bar': {
          const options = { ...baseOptions, ...(chartData.options || {}) } as ChartOptions<'bar'>;
          const data = chartDataProp as ChartJSData<'bar'>;
          return (
            <div style={chartContainerStyle}>
              <Bar options={options} data={data} />
            </div>
          );
        }
        case 'pie': {
          const options = {
            ...baseOptions,
            maintainAspectRatio: false,
            ...(chartData.options || {}),
          } as ChartOptions<'pie'>;
          const data = chartDataProp as ChartJSData<'pie'>;
          return (
            <div style={chartContainerStyle}>
              <Pie options={options} data={data} />
            </div>
          );
        }
        case 'line': {
          const options = { ...baseOptions, ...(chartData.options || {}) } as ChartOptions<'line'>;
          const data = chartDataProp as ChartJSData<'line'>;
          return (
            <div style={chartContainerStyle}>
              <Line options={options} data={data} />
            </div>
          );
        }
        case 'area': {
          // Area는 Line으로 렌더링
          const options = { ...baseOptions, ...(chartData.options || {}) } as ChartOptions<'line'>;
          // Area 차트 데이터셋에는 fill: true가 필요 (이미 설정되어 있어야 함)
          const data = chartDataProp as ChartJSData<'line'>;
          return (
            <div style={chartContainerStyle}>
              <Line options={options} data={data} />
            </div>
          );
        }
        case 'donut': {
          // Donut은 Pie로 렌더링
          const options = {
            ...baseOptions,
            maintainAspectRatio: false,
            cutout: '50%',
            ...(chartData.options || {}),
          } as ChartOptions<'pie'>;
          const data = chartDataProp as ChartJSData<'pie'>;
          return (
            <div style={chartContainerStyle}>
              <Pie options={options} data={data} />
            </div>
          );
        }
        default: {
          return (
            <p className="flex items-center justify-center h-full text-sm text-gray-600">
              지원되지 않는 차트 유형입니다
            </p>
          );
        }
      }
    } catch (error) {
      console.error('Error rendering chart:', chartData.id, chartData.chartType, error);
      return (
        <p className="flex items-center justify-center h-full text-sm text-red-600">
          차트를 렌더링하는 중 오류가 발생했습니다
        </p>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          {getChartIcon(chartData.chartType)}
          {chartData.title}
        </CardTitle>
        {chartData.description && <CardDescription>{chartData.description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderChartContent()}</CardContent>
    </Card>
  );
}
