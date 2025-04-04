'use client';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ESGCombobox } from './combobox';
import DataTable from './datatable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { ChartType, ChartData } from '@/types/chart';

interface ESGChartDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChartAdd?: (chart: ChartData) => void;
}

export function ESGChartDialog({ open, setOpen, onChartAdd }: ESGChartDialogProps) {
  const [step, setStep] = useState<'combobox' | 'datatable'>('combobox');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartDescription, setChartDescription] = useState('');
  const [colSpan, setColSpan] = useState<1 | 2 | 3 | 4>(1);
  const [selectedESG, setSelectedESG] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<ChartData['datasets']>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 다음 단계로 이동하는 함수
   * 첫 번째 단계(combobox)에서는 데이터 입력 단계로 전환하고
   * 두 번째 단계(datatable)에서는 저장 처리를 수행합니다.
   */
  const handleNext = () => {
    if (step === 'combobox') {
      setStep('datatable');
    } else {
      handleSave();
    }
  };

  /**
   * 이전 단계로 돌아가는 함수
   * 데이터 입력 단계에서 ESG 항목 선택 단계로 돌아갑니다.
   */
  const handleBack = () => {
    setStep('combobox');
  };

  /**
   * 데이터 테이블 변경 콜백 함수
   * DataTable 컴포넌트에서 데이터가 변경될 때 호출됩니다.
   * @param newLabels 새로운 라벨 배열
   * @param newDatasets 새로운 데이터셋 배열
   */
  const handleDataChange = useCallback(
    (newLabels: string[], newDatasets: ChartData['datasets']) => {
      setLabels(newLabels);
      setDatasets(newDatasets);
    },
    []
  );

  /**
   * ESG 항목 변경 콜백 함수
   * ESGCombobox 컴포넌트에서 선택 항목이 변경될 때 호출됩니다.
   * @param value 선택된 ESG 항목 값
   */
  const handleESGChange = useCallback((value: string | null) => {
    setSelectedESG(value);
  }, []);

  /**
   * 차트 데이터 저장 함수
   * 입력된 모든 데이터를 검증하고 API를 통해 저장합니다.
   */
  const handleSave = async () => {
    if (!chartTitle) {
      alert('차트 제목을 입력해주세요');
      return;
    }
    if (!selectedESG) {
      alert('ESG 항목을 선택해주세요.');
      return;
    }
    if (
      step === 'datatable' &&
      (labels.length === 0 ||
        datasets === undefined ||
        datasets.length === 0 ||
        datasets.some(ds => !ds || ds.data.length === 0))
    ) {
      alert('차트 데이터를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    const newChart: ChartData = {
      id: uuidv4(),
      title: chartTitle,
      description: chartDescription,
      type: chartType,
      colSpan: colSpan,
      esg: selectedESG,
      labels: labels,
      datasets: datasets,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChart),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.statusText}`);
      }

      const savedChart = await response.json();
      console.log('차트 저장 성공:', savedChart);

      if (onChartAdd) {
        onChartAdd(savedChart);
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('차트 저장 실패:', error);
      alert('차트 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 폼 초기화 함수
   * 모든 입력 필드와 상태를 초기값으로 리셋합니다.
   */
  const resetForm = () => {
    setChartTitle('');
    setChartDescription('');
    setChartType('bar');
    setColSpan(1);
    setSelectedESG(null);
    setLabels([]);
    setDatasets([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900 w-auto sm:min-w-[500px] sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">차트 추가</DialogTitle>
          <DialogClose
            className="absolute text-gray-500 top-2 right-2 hover:text-black"
            onClick={() => setOpen(false)}
          ></DialogClose>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'combobox' && (
            <div className="space-y-6">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">ESG 항목</Label>
                <div className="col-span-3">
                  <ESGCombobox value={selectedESG} onValueChange={handleESGChange} />
                </div>
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-title" className="text-right">
                  제목
                </Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={e => setChartTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-description" className="text-right">
                  설명
                </Label>
                <Input
                  id="chart-description"
                  value={chartDescription}
                  onChange={e => setChartDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">차트 유형</Label>
                <Select value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="차트 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">바 차트</SelectItem>
                    <SelectItem value="line">라인 차트</SelectItem>
                    <SelectItem value="pie">파이 차트</SelectItem>
                    <SelectItem value="area">영역 차트</SelectItem>
                    <SelectItem value="donut">도넛 차트</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">차트 크기</Label>
                <Select
                  value={String(colSpan)}
                  onValueChange={value => setColSpan(Number(value) as 1 | 2 | 3 | 4)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="차트 크기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1칸</SelectItem>
                    <SelectItem value="2">2칸</SelectItem>
                    <SelectItem value="3">3칸</SelectItem>
                    <SelectItem value="4">4칸</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 'datatable' && (
            <div>
              <DataTable
                onDataChange={handleDataChange}
                initialLabels={labels}
                initialDatasets={datasets}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          {step === 'datatable' && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              이전
            </Button>
          )}
          <Button
            className="px-4 py-2 text-white bg-black border border-black rounded hover:bg-white hover:text-black"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : step === 'combobox' ? '다음' : '완료'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
