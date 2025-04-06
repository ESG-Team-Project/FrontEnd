'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
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
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

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
  const [tableKey, setTableKey] = useState(0);
  const prevDataLength = useRef({ labels: 0, datasets: 0 });
  const [worker, setWorker] = useState<Worker | null>(null);

  // Web Worker 초기화
  useEffect(() => {
    const csvWorker = new Worker(new URL('../../worker/csvWorker.ts', import.meta.url), {
      type: 'module',
    });

    csvWorker.onmessage = event => {
      const { labels, datasets } = event.data;
      setLabels(labels);
      setDatasets(datasets);
    };

    setWorker(csvWorker);

    return () => {
      csvWorker.terminate();
    };
  }, []);

  const handleFile = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && worker) {
      worker.postMessage(file);
    }
  };

  useEffect(() => {
    if (!datasets || !labels) return;
    if (
      prevDataLength.current.labels !== labels.length ||
      prevDataLength.current.datasets !== datasets.length
    ) {
      setTableKey(prevKey => prevKey + 1);
      prevDataLength.current = { labels: labels.length, datasets: datasets.length };
    }
  }, [labels, datasets]);

  const handleNext = () => {
    if (step === 'combobox') {
      setStep('datatable');
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    setStep('combobox');
  };

  const handleDataChange = useCallback(
    (newLabels: string[], newDatasets: ChartData['datasets']) => {
      setLabels(newLabels);
      setDatasets(newDatasets);
    },
    []
  );

  const handleESGChange = useCallback((value: string | null) => {
    setSelectedESG(value);
  }, []);

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

  const resetForm = () => {
    setChartTitle('');
    setChartDescription('');
    setChartType('bar');
    setColSpan(1);
    setSelectedESG(null);
    setLabels([]);
    setDatasets([]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => handleFile(acceptedFiles),
    accept: { 'text/csv': ['.csv'] },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900 w-auto sm:min-w-[500px] sm:max-w-[80vw]">
        <DialogDescription>CSV 업로드 후 차트를 설정하세요</DialogDescription>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">차트 추가</DialogTitle>
          <DialogClose
            className="absolute text-gray-500 top-2 right-2 hover:text-black"
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        <div className="space-y-4">
          {step === 'combobox' && (
            <div className="space-y-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-title" className="text-right">제목</Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={e => setChartTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">ESG 항목</Label>
                <div className="col-span-3">
                  <ESGCombobox value={selectedESG} onValueChange={handleESGChange} />
                </div>
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-description" className="text-right">설명</Label>
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
            <>
              <div
                {...getRootProps()}
                className="w-full p-6 text-center border border-gray-300 rounded-lg cursor-pointer dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center w-full">
                  <Upload className="w-full h-10 text-gray-500 dark:text-gray-400" />
                  <p className="w-full mt-2 text-gray-600 dark:text-gray-300">
                    CSV 파일을 추가하려면 파일 선택 <br /> 또는 여기로 파일을 끌고 오세요
                  </p>
                </div>
              </div>

              <DataTable
                key={tableKey}
                onDataChange={handleDataChange}
                initialLabels={labels}
                initialDatasets={datasets}
              />
            </>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {step === 'datatable' && (
            <Button variant="outline" onClick={handleBack}>
              이전
            </Button>
          )}
          <Button onClick={handleNext} disabled={isLoading}>
            {step === 'combobox' ? '다음' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
