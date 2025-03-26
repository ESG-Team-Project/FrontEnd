import { Bar, BarChart } from 'recharts'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Card, CardContent, CardHeader } from './ui/card'

const chartData = [
	{ month: 'January', desktop: 186, mobile: 80 },
	{ month: 'February', desktop: 305, mobile: 200 },
	{ month: 'March', desktop: 237, mobile: 120 },
	{ month: 'April', desktop: 73, mobile: 190 },
	{ month: 'May', desktop: 209, mobile: 130 },
	{ month: 'June', desktop: 214, mobile: 140 },
]

const chartConfig = {
	desktop: {
		label: 'Desktop',
		color: '#2563eb',
	},
	mobile: {
		label: 'Mobile',
		color: '#60a5fa',
	},
} satisfies ChartConfig

type ChartProps = {
	label: string
}

export function ChartAreaInteractive(props: ChartProps) {
	const { label } = props
	return (
		<Card>
			<CardHeader>
				<label>{label}</label>
			</CardHeader>
			<CardContent className='z-0'>
				<ChartContainer config={chartConfig}>
					<BarChart data={chartData} className="min-h-[200px] min-w-[300px]">
						<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
						<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
