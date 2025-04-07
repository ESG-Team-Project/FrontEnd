'use client';

import { ESGChartDialog } from '@/app/modal/chartinput-form';
import DashboardShell from '@/components/dashboard-shell';
import TotalCharts from '@/components/dashboards/TotalCharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { chartService } from '@/lib/api';
import type { ChartData, ChartType } from '@/types/chart';
import { type ApiChartData, transformApiToChartData } from '@/types/chart';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData as ChartJSData,
  type ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  Activity,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
  FileText,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  PlusCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { v4 as uuidv4 } from 'uuid';
import { useDashboard } from '@/contexts/dashboard-context';
import { dashboardColumnsAtom } from '@/lib/atoms';
import { useAtom } from 'jotai';

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

// 샘플 차트 데이터 (새로운 구조로 정의)
const sampleCharts: ChartData[] = [
  {
    id: '1',
    title: '부서별 ESG 준수도 현황',
    chartType: 'bar',
    description: '각 부서별 ESG 준수 현황을 표시합니다.',
    category: 'governance',
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
    chartType: 'pie',
    description: 'ESG 각 영역별 투자 비율을 보여줍니다.',
    category: 'esg-overview',
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
    chartType: 'line',
    description: '최근 6분기 동안의 ESG 점수 변화 추이입니다.',
    category: 'esg-overview',
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
    chartType: 'area',
    description: '최근 6개월 간 환경 지표 달성 추이입니다.',
    category: 'environment',
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

// 반응형 열 크기 클래스 조정
const getColumnClass = (colSpan = 1, columnsCount: 3 | 4 = 4) => {
  const lgColSpan = columnsCount === 3 ? Math.min(colSpan, 3) : Math.min(colSpan, 4);
  
  switch (colSpan) {
    case 1:
      return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-1';
    case 2:
      return `col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-${Math.min(2, lgColSpan)} xl:col-span-${Math.min(2, lgColSpan)}`;
    case 3:
      return `col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-${Math.min(3, lgColSpan)} xl:col-span-${Math.min(3, lgColSpan)}`;
    case 4:
      return `col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-${lgColSpan} xl:col-span-${lgColSpan}`;
    default:
      return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-1';
  }
};

export default function Dashboard() {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [dashboardColumns] = useAtom(dashboardColumnsAtom);

  useEffect(() => {
    console.log('대시보드 컴포넌트가 마운트되었습니다.');

    const fetchCharts = async () => {
      setIsLoading(true);
      setError(null);

      console.log('차트 데이터를 불러오는 중...');
      try {
        const apiCharts = await chartService.getCharts();
        console.log(`총 ${apiCharts.length}개의 차트를 불러왔습니다.`);

        // apiCharts를 ChartData 형식으로 변환
        const transformedCharts = apiCharts
          .map((apiChart: unknown) => {
            try {
              // API 응답의 추가적인 검증
              if (
                typeof apiChart === 'object' &&
                apiChart !== null &&
                'userId' in apiChart &&
                'title' in apiChart &&
                'chartType' in apiChart
              ) {
                return transformApiToChartData(apiChart as ApiChartData);
              }
              console.error('유효하지 않은 차트 데이터:', apiChart);
              return null;
            } catch (err) {
              console.error('차트 데이터 변환 오류:', err);
              return null;
            }
          })
          .filter((chart): chart is ChartData => chart !== null);

        setCharts(transformedCharts.length > 0 ? transformedCharts : sampleCharts);
        setError(null);
      } catch (error) {
        console.error('차트 데이터를 불러오는 중 오류 발생:', error);
        setCharts(sampleCharts); // 오류 발생 시 샘플 데이터 사용
        setError('차트 데이터를 불러오는 중 오류가 발생했습니다. 샘플 데이터를 표시합니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharts();
  }, []);

  // 차트 추가 함수
  const addChart = (newChart: ChartData) => {
    setCharts((prev) => [...prev, { ...newChart, id: uuidv4() }]);
  };

  // 차트 아이콘 선택 함수
  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
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

  return (
    <DashboardShell
      pageTitle="ESG 대시보드"
      rightMenuItems={
        <Button
          variant="outline"
          className="h-8 px-2 text-xs bg-white md:text-sm md:px-4 md:h-9"
          onClick={() => setIsChartModalOpen(true)}
        >
          차트 추가
        </Button>
      }
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ESG 대시보드</h1>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="w-full h-64 animate-pulse">
              <CardContent className="flex items-center justify-center h-full">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={dashboardColumns === 3 ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4'}>
          {charts.map((chart) => (
            <div key={chart.id} className={getColumnClass(chart.colSpan, dashboardColumns)}>
              <TotalCharts chartData={chart} />
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      <ESGChartDialog
        open={isChartModalOpen}
        setOpen={setIsChartModalOpen}
        onChartAdd={(newChart) => {
          console.log('새 차트 추가됨:', newChart);
          // 차트 배열에 새 차트 추가
          setCharts((prevCharts) => [...prevCharts, newChart]);
        }}
      />
    </DashboardShell>
  );
}
