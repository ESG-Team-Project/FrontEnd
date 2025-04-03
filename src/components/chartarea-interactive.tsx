import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ChartConfig는 타입으로만 사용되므로 type import 사용
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Chart.js에 필요한 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

type ChartProps = {
  label: string;
};

export function ChartAreaInteractive(props: ChartProps) {
  const { label } = props;

  // Chart.js 데이터 형식으로 변환
  const data = {
    labels: chartData.map(item => item.month),
    datasets: [
      {
        label: chartConfig.desktop.label,
        data: chartData.map(item => item.desktop),
        backgroundColor: chartConfig.desktop.color,
        borderRadius: 4,
      },
      {
        label: chartConfig.mobile.label,
        data: chartData.map(item => item.mobile),
        backgroundColor: chartConfig.mobile.color,
        borderRadius: 4,
      },
    ],
  };

  // Chart.js 옵션 설정 (툴크, 범례 등 커스터마이징 가능)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: false,
        grid: {
          color: 'hsl(var(--border) / 0.5)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="z-0">
        <ChartContainer config={chartConfig} className="min-h-[200px] min-w-[300px]">
          {/* @ts-expect-error - Bar component from chartjs 타입 호환성 문제 */}
          <Bar options={options} data={data} />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
