'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ESGCombobox } from './combobox'; // ESG 항목 선택 컴포넌트
import DataTable from './datatable'; // 데이터 입력 테이블 컴포넌트
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { v4 as uuidv4 } from 'uuid';
import { ChartType, ChartData, ChartCreateInput } from '@/types/chart';

interface ESGChartDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChartAdd?: (chart: ChartData) => void; // 차트 추가 콜백
}

export function ESGChartDialog({ open, setOpen, onChartAdd }: ESGChartDialogProps) {
  const [step, setStep] = useState<'combobox' | 'datatable'>('combobox'); // 현재 단계 상태
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartDescription, setChartDescription] = useState('');
  const [colSpan, setColSpan] = useState<1 | 2 | 3 | 4>(1);

  const handleNext = () => {
    if (step === 'combobox') {
      setStep('datatable'); // 다음 단계로 전환
    } else {
      handleSave();
    }
  };

  const handleSave = () => {
    if (!chartTitle) {
      alert('차트 제목을 입력해주세요');
      return;
    }

    // 새 차트 객체 생성
    const newChart: ChartData = {
      id: uuidv4(),
      title: chartTitle,
      description: chartDescription,
      type: chartType,
      colSpan: colSpan,
      data: getSampleData(chartType),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 부모 컴포넌트로 전달
    if (onChartAdd) {
      onChartAdd(newChart);
    }

    // 폼 초기화 및 닫기
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setChartTitle('');
    setChartDescription('');
    setChartType('bar');
    setColSpan(1);
  };

  // 차트 타입별 샘플 데이터 생성
  const getSampleData = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return {
          categories: ['카테고리1', '카테고리2', '카테고리3'],
          values: [65, 78, 82],
          colors: ['blue', 'green', 'purple']
        };
      case 'line':
        return {
          labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
          datasets: [
            {
              name: 'Dataset 1',
              values: [65, 59, 80, 81, 56, 55]
            },
            {
              name: 'Dataset 2',
              values: [28, 48, 40, 19, 86, 27]
            }
          ]
        };
      case 'pie':
        return {
          items: [
            { name: '항목 1', value: '45%' },
            { name: '항목 2', value: '30%' },
            { name: '항목 3', value: '25%' }
          ]
        };
      default:
        return {};
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col w-screen p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">차트 추가</DialogTitle>
          <DialogClose
            className="absolute text-gray-500 top-2 right-2 hover:text-black"
            onClick={() => setOpen(false)}
          ></DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'combobox' && (
            <div>
              {/* 차트 제목 입력 */}
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-title" className="text-right">
                  제목
                </Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* ESG 항목 선택 */}
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">ESG 항목</Label>
                <ESGCombobox />
              </div>

              {/* 차트 설명 입력 */}
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-description" className="text-right">
                  설명
                </Label>
                <Input
                  id="chart-description"
                  value={chartDescription}
                  onChange={(e) => setChartDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* 차트 유형 선택 */}
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">차트 유형</Label>
                <RadioGroup
                  value={chartType}
                  onValueChange={(value) => setChartType(value as ChartType)}
                  className="flex flex-col gap-2 col-span-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bar" id="chart-bar" />
                    <Label htmlFor="chart-bar">바 차트</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="line" id="chart-line" />
                    <Label htmlFor="chart-line">라인 차트</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pie" id="chart-pie" />
                    <Label htmlFor="chart-pie">파이 차트</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="area" id="chart-area" />
                    <Label htmlFor="chart-area">영역 차트</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="donut" id="chart-donut" />
                    <Label htmlFor="chart-donut">도넛 차트</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 차트 크기 선택 */}
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">차트 크기</Label>
                <RadioGroup
                  value={String(colSpan)}
                  onValueChange={(value) => setColSpan(Number(value) as 1 | 2 | 3 | 4)}
                  className="grid grid-cols-4 gap-2 col-span-3"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 mb-1 border border-gray-300 rounded"></div>
                    <RadioGroupItem value="1" id="size-1" />
                    <Label htmlFor="size-1">1칸</Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-10 mb-1 border border-gray-300 rounded"></div>
                    <RadioGroupItem value="2" id="size-2" />
                    <Label htmlFor="size-2">2칸</Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-10 mb-1 border border-gray-300 rounded"></div>
                    <RadioGroupItem value="3" id="size-3" />
                    <Label htmlFor="size-3">3칸</Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-10 mb-1 border border-gray-300 rounded"></div>
                    <RadioGroupItem value="4" id="size-4" />
                    <Label htmlFor="size-4">4칸</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 'datatable' && (
            <div>
              {/* 데이터 입력 테이블 */}
              <DataTable />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            className="px-4 py-2 mt-4 text-white bg-black border border-black rounded w-1/8 hover:bg-white hover:text-black"
            onClick={handleNext} // 단계 전환 버튼
          >
            {step === 'combobox' ? '다음' : '완료'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
