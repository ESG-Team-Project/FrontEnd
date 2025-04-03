'use client';

import * as React from 'react';
// import * as RechartsPrimitive from 'recharts'; // recharts import 제거

import { cn } from '@/lib/utils';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ReactNode;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    // eslint-disable-next-line react/no-danger
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  );
};

// recharts 기반 Tooltip 및 Legend 관련 컴포넌트 제거 또는 주석 처리
// const ChartTooltip = RechartsPrimitive.Tooltip;
// ... (ChartTooltipContent 구현 제거)
// const ChartLegend = RechartsPrimitive.Legend;
// ... (ChartLegendContent 구현 제거)

// Helper to extract item config from a payload.
// 이 함수는 recharts 페이로드 구조에 의존하므로 제거하거나 Chart.js 데이터 구조에 맞게 수정 필요
// function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
//   // ... (구현 제거)
// }

export {
  ChartContainer,
  // ChartTooltip, // 제거
  // ChartTooltipContent, // 제거
  // ChartLegend, // 제거
  // ChartLegendContent, // 제거
  ChartStyle,
  useChart, // useChart export 추가
  ChartContext, // ChartContext export 추가
  // type ChartConfig, // Remove duplicate type export
}; // Export ChartConfig type separately if needed, but it's already exported above

export type { ChartConfig }; // Export type separately if needed by consumers
