// BarChart.tsx
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

// Chart.js에 필요한 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  labels: string[]
  values: number[]
}

export default function BarChart({ labels, values }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: '입력 데이터',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '막대 차트' }
    }
  }

  return <Bar data={data} options={options} />
}
