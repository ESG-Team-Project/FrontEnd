'use client';

import { useEffect, useState } from 'react';
import { chartService } from '@/lib/api';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import {
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Activity,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { ChartData, DrawChartData } from '@/types/chart';
import DashboardShell from '@/components/dashboard-shell';
import TotalCharts from '@/components/dashboards/TotalCharts';
import { Button } from '@/components/ui/button';
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
import { FileInputDialog } from '@/app/modal/fileinput-form';
import { ESGChartDialog } from '@/app/modal/chartinput-form'; //=!=
import { CustomButton } from '@/components/ui/custom-button';

// Chart.js에 필요한 모든 요소 등록
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

// 샘플 차트 데이터 (데이터 구조는 Chart.js 형식에 맞춤)
const sampleCharts: ChartData[] = [
  {
    id: '1',
    title: '부서별 ESG 준수도 현황',
    type: 'bar',
    description: '각 부서별 ESG 준수 현황을 표시합니다.',
    esg: 'governance',
    labels: ['경영부', '개발부', '마케팅부', '인사부', '재무부', '고객서비스부'],
    datasets: [
      {
        label: 'ESG 준수도',
        data: [85, 72, 78, 90, 67, 82],
        backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
        borderColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
        borderWidth: 1,
      },
    ],
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
    colSpan: 1,
  },
  {
    id: '2',
    title: 'ESG 카테고리별 투자 비율',
    type: 'pie',
    description: 'ESG 각 영역별 투자 비율을 보여줍니다.',
    esg: 'esg-overview',
    labels: ['환경', '사회', '거버넌스', '기타'],
    datasets: [
      {
        label: '투자 비율',
        data: [35, 25, 30, 10],
        backgroundColor: ['#2ecc71', '#3498db', '#f39c12', '#95a5a6'],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      },
    ],
    options: {
      plugins: { legend: { position: 'top' } },
    },
    colSpan: 1,
  },
  {
    id: '3',
    title: '분기별 ESG 점수 추이',
    type: 'line',
    description: '최근 6분기 동안의 ESG 점수 변화 추이입니다.',
    esg: 'esg-overview',
    labels: ['1Q 2023', '2Q 2023', '3Q 2023', '4Q 2023', '1Q 2024', '2Q 2024'],
    datasets: [
      {
        label: 'ESG 점수',
        data: [65, 67, 70, 73, 75, 78],
        borderColor: '#3498db',
        tension: 0.1,
      },
    ],
    options: {
      scales: { y: { beginAtZero: false } },
    },
    colSpan: 1,
  },
  {
    id: '4',
    title: '환경 지표 진행 상황',
    type: 'area',
    description: '최근 6개월 간 환경 지표 달성 추이입니다.',
    esg: 'environment',
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: '환경 지표',
        data: [30, 45, 42, 50, 55, 60],
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
    options: {
      scales: { y: { beginAtZero: true } },
    },
    colSpan: 1,
  },
];

export default function Dashboard() {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [drawCharts, setDrawCharts] = useState<DrawChartData[]>([]);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);

  useEffect(() => {
    console.log('대시보드 컴포넌트가 마운트되었습니다.');

    const fetchCharts = async () => {
      console.log('차트 데이터를 불러오는 중...');
      try {
        const charts = await chartService.getCharts();
        console.log(`총 ${charts.length}개의 차트를 불러왔습니다.`);

        const transformedCharts = charts.map(
          chart =>
            ({
              id: chart.id, // userId를 id로 변환
              title: chart.title,
              type: chart.chartType.toLowerCase(),
              description: chart.description,
              esg: chart.category.toLowerCase(),
              labels: chart.data.map(item => item.label), // data에서 labels 추출
              datasets: [
                {
                  label: chart.indicator,
                  data: chart.data.map(item => item.key), // data에서 key를 추출
                  backgroundColor: chart.data.map(() => '#3498db'),
                  borderColor: chart.data.map(() => '#2980b9'),
                  borderWidth: 1,
                },
              ],
              options: {
                plugins: { legend: { display: true } },
                scales: { x: { beginAtZero: true } },
              },
              colSpan: chart.chartGrid || 1, // chartGrid를 colSpan으로 매핑
            }) as DrawChartData
        );

        setDrawCharts(transformedCharts);
      } catch (error) {
        console.error('차트 데이터를 불러오는 중 오류 발생:', error);
        setCharts(sampleCharts); // 오류 발생 시 샘플 데이터 사용
      }
    };

    fetchCharts(); // 함수 호출
  }, []);

  // 차트 추가 함수
  const addChart = (newChart: ChartData) => {
    setCharts(prev => [...prev, { ...newChart, id: uuidv4() }]);
  };

  // 차트 아이콘 선택 함수
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return <LineChartIcon className="w-5 h-5 mr-2" />;
      case 'bar':
        return <BarChartIcon className="w-5 h-5 mr-2" />;
      case 'area':
        return <AreaChartIcon className="w-5 h-5 mr-2" />;
      case 'pie':
      case 'donut':
        return <PieChartIcon className="w-5 h-5 mr-2" />;
      default:
        return <LineChartIcon className="w-5 h-5 mr-2" />;
    }
  };

  // 차트 컴포넌트 렌더링 함수 수정 (타입 단언 추가)
  const renderChartContent = (chart: ChartData) => {
    // chart.options와 기본 옵션을 병합하되, 타입을 ChartOptions<typeof chart.type>으로 구체화 시도
    // 단, chart.type이 'area', 'donut'일 수 있으므로 주의 필요
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
      labels: chart.labels || [],
      datasets: chart.datasets || [],
    };

    const chartContainerStyle = { height: '250px', width: '100%' };

    try {
      switch (chart.chartType) {
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
          const options = { ...baseOptions, ...(chart.options || {}) } as ChartOptions<'line'>; // Line 옵션 사용
          // Area 차트 데이터셋에는 fill: true가 필요 (sampleCharts에 이미 설정됨)
          const data = chartDataProp as ChartJSData<'line'>; // Line 데이터 사용
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
          } as ChartOptions<'pie'>; // Pie 옵션 사용
          const data = chartDataProp as ChartJSData<'pie'>; // Pie 데이터 사용
          return (
            <div style={chartContainerStyle}>
              <Pie options={options} data={data} />
            </div>
          );
        }
        default: {
          // 컴파일 타임에 모든 케이스를 처리했는지 확인 (never 타입 활용)
          const exhaustiveCheck: never = chart.chartType;
          return (
            <p className="flex items-center justify-center h-full text-sm text-gray-600">
              지원되지 않는 차트 유형입니다: {exhaustiveCheck}
            </p>
          );
        }
      }
    } catch (error) {
      console.error('Error rendering chart:', chart.id, chart.chartType, error);
      return (
        <p className="flex items-center justify-center h-full text-sm text-red-600">
          차트를 렌더링하는 중 오류가 발생했습니다.
        </p>
      );
    }
  };

  // 반응형 열 크기 클래스 조정
  const getColumnClass = (colSpan = 1) => {
    switch (colSpan) {
      case 1:
        return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-1';
      case 2:
        return 'col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-2 xl:col-span-2';
      case 3:
        return 'col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-3 xl:col-span-3';
      case 4:
        return 'col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 xl:col-span-4';
      default:
        return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-1';
    }
  };

  return (
    <DashboardShell
      pageTitle="ESG 대시보드"
      rightMenuItems={
        <>
          <Button
            variant="outline"
            className="h-8 px-2 text-xs bg-white md:text-sm md:px-4 md:h-9"
            onClick={() => setIsChartModalOpen(true)}
          >
            차트 추가
          </Button>
          <Button
            variant="outline"
            className="h-8 px-2 ml-2 text-xs bg-white md:text-sm md:px-4 md:h-9"
            onClick={() => setFileModalOpen(true)}
          >
            파일 선택
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ESG 대시보드</h1>
        <Button onClick={() => setIsChartModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> 차트 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        {drawCharts.map(chart => (
          <div key={chart.id} className={getColumnClass(chart.colSpan)}>
            <TotalCharts chartData={chart} />
          </div>
        ))}
      </div>

      {/* 모달 */}
      <ESGChartDialog open={isChartModalOpen} setOpen={setIsChartModalOpen} />
      <FileInputDialog open={fileModalOpen} setOpen={setFileModalOpen} />
    </DashboardShell>
  );
}
