import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
} from 'lucide-react';
import type { ChartData, DrawChartData } from '@/types/chart';
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
  chartData: DrawChartData;
}

// 차트 아이콘 반환 함수 (유지)
const getChartIcon = (type: string) => {
  switch (type) {
    case 'bar':
      return <BarChartIcon className="w-5 h-5 mr-2 text-blue-500" />;
    case 'pie':
      return <PieChartIcon className="w-5 h-5 mr-2 text-green-500" />;
    case 'line':
      return <LineChartIcon className="w-5 h-5 mr-2 text-yellow-500" />;
    case 'area':
      return <AreaChartIcon className="w-5 h-5 mr-2 text-purple-500" />;
    case 'donut': // 도넛 아이콘 추가
      return <PieChartIcon className="w-5 h-5 mr-2 text-indigo-500" />; // 파이 아이콘 재활용 또는 다른 아이콘
    default:
      return <BarChartIcon className="w-5 h-5 mr-2" />;
  }
};

// 차트 콘텐츠를 렌더링하는 함수 (page.tsx 로직 가져오기)
const renderChartContent = (chart: DrawChartData) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!chart.datasets && chart.datasets.length > 1, // 데이터셋이 2개 이상일 때만 범례 표시
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    // scales 기본 설정 추가 (필요 시)
    scales: {
      x: { display: chart.type !== 'pie' && chart.type !== 'donut' }, // 파이/도넛 외 표시
      y: { display: chart.type !== 'pie' && chart.type !== 'donut' }, // 파이/도넛 외 표시
    },
  };

  const chartDataProp = {
    labels: chart.labels || [],
    datasets: chart.datasets || [],
  };

  // 높이를 고정하지 않고 aspect-ratio를 사용하거나, CardContent 크기에 맞춤
  // const chartContainerStyle = { height: '200px', width: '100%' };
  const chartContainerStyle = { position: 'relative', width: '100%', height: '200px' };

  try {
    switch (chart.type) {
      case 'bar': {
        const options = { ...baseOptions, ...(chart.options || {}) } as ChartOptions<'bar'>;
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
          ...(chart.options || {}),
        } as ChartOptions<'pie'>;
        const data = chartDataProp as ChartJSData<'pie'>;
        return (
          <div style={chartContainerStyle}>
            <Pie options={options} data={data} />
          </div>
        );
      }
      case 'line': {
        const options = { ...baseOptions, ...(chart.options || {}) } as ChartOptions<'line'>;
        const data = chartDataProp as ChartJSData<'line'>;
        return (
          <div style={chartContainerStyle}>
            <Line options={options} data={data} />
          </div>
        );
      }
      case 'area': {
        // Area는 Line으로 렌더링
        const options = { ...baseOptions, ...(chart.options || {}) } as ChartOptions<'line'>;
        // Area 차트 데이터셋에는 fill: true가 필요
        const data = {
          ...chartDataProp,
          datasets: chartDataProp.datasets.map(ds => ({ ...ds, fill: true })), // 명시적으로 fill: true 추가
        } as ChartJSData<'line'>;
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
          ...(chart.options || {}),
        } as ChartOptions<'pie'>;
        const data = chartDataProp as ChartJSData<'pie'>;
        return (
          <div style={chartContainerStyle}>
            <Pie options={options} data={data} />
          </div>
        );
      }
      default: {
        // 컴파일 타임 체크는 어려우므로 런타임 메시지 표시
        return (
          <p className="flex items-center justify-center h-full text-sm text-gray-600">
            지원되지 않는 차트 유형입니다: {chart.type}
          </p>
        );
      }
    }
  } catch (error) {
    console.error('Error rendering chart:', chart.id, chart.type, error);
    return (
      <p className="flex items-center justify-center h-full text-sm text-red-600">
        차트를 렌더링하는 중 오류가 발생했습니다.
      </p>
    );
  }
};

const TotalCharts: React.FC<TotalChartsProps> = ({ chartData }) => {
  // 데이터 유효성 검사 추가
  const isValidData = chartData && chartData.labels && chartData.datasets;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
      <CardHeader className="p-3 pb-1 md:p-4">
        <CardTitle className="flex items-center text-sm md:text-base lg:text-lg line-clamp-1">
          {getChartIcon(chartData.type)}
          <span className="truncate">{chartData.title}</span>
        </CardTitle>
        {chartData.description && (
          <CardDescription className="mt-1 text-xs truncate md:text-sm line-clamp-1">
            {chartData.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-2 md:p-4">
        {/* 데이터가 유효할 때만 차트 렌더링 */}
        {isValidData ? (
          renderChartContent(chartData)
        ) : (
          <div className="w-full h-[200px] flex items-center justify-center bg-gray-50 rounded">
            <p className="text-sm text-muted-foreground">차트 데이터가 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalCharts;
