'use client';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Value } from '@radix-ui/react-select';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { ESGCombobox, esgIndicators } from './combobox';
import DataTable from './datatable';
import { useDashboard } from '@/contexts/dashboard-context';
import { griCategories } from '@/data/griCategories';
import api from '@/lib/api';
import { getCompanyGriData } from '@/services/api/gri-service';
import type {
  ApiChartData,
  ApiChartDataItem,
  ApiChartStyle,
  ChartData,
  ChartType,
} from '@/types/chart';
import type { CompanyGRICategoryValue, CompanyGRIData } from '@/types/companyGriData';

interface ESGChartDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChartAdd?: (chart: ChartData) => void;
}

export function ESGChartDialog({ open, setOpen, onChartAdd }: ESGChartDialogProps) {
  // 단계 상태를 더 세분화
  const [step, setStep] = useState<'info' | 'dataSource' | 'esgSelect' | 'datatable' | 'griSelect'>(
    'info'
  );
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartDescription, setChartDescription] = useState('');
  const [colSpan, setColSpan] = useState<1 | 2 | 3 | 4>(1);
  const [selectedESG, setSelectedESG] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[] | number[]>([]);
  const [datasets, setDatasets] = useState<ChartData['datasets']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ label: string; key: number; unit?: string }[]>([]);
  const [file, setFile] = useState<File>();
  const [tableKey, setTableKey] = useState(0);
  const prevDataLength = useRef({ labels: 0, datasets: 0 });
  const [worker, setWorker] = useState<Worker | null>(null);

  // 데이터 소스 선택을 위한 상태 추가
  const [dataSource, setDataSource] = useState<'gri' | 'direct' | 'csv'>('direct');

  // GRI 데이터 관련 상태
  const { companyId } = useDashboard(); // 회사 ID 가져오기
  const [griData, setGriData] = useState<CompanyGRIData | null>(null);
  const [isLoadingGriData, setIsLoadingGriData] = useState(false);
  const [griDataError, setGriDataError] = useState<string | null>(null);
  const [selectedGriCategory, setSelectedGriCategory] = useState<string | null>(null);

  // 수치화된 GRI 카테고리만 필터링
  const quantitativeGriCategories = griCategories.filter(
    (category) =>
      category.isQuantitative ||
      category.defaultDataType === 'numeric' ||
      category.defaultDataType === 'timeSeries'
  );

  // Web Worker 초기화
  useEffect(() => {
    if (dataSource === 'csv') {
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
    }
  }, [dataSource]);

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

  // GRI 데이터 로드 함수
  const loadGriData = useCallback(async () => {
    if (!companyId) return;

    try {
      setIsLoadingGriData(true);
      setGriDataError(null);
      const data = await getCompanyGriData(companyId);
      setGriData(data);
    } catch (err) {
      console.error('GRI 데이터 로드 중 오류:', err);
      setGriDataError('GRI 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingGriData(false);
    }
  }, [companyId]);

  // 모달이 열릴 때 GRI 데이터 로드
  useEffect(() => {
    if (open && dataSource === 'gri' && !griData) {
      loadGriData();
    }
  }, [open, dataSource, griData, loadGriData]);

  const handleFile = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && worker) {
      worker.postMessage(file);
    }
  };

  const handleNext = () => {
    if (step === 'info') {
      // 기본 정보 입력 후 데이터 소스 선택 단계로
      setStep('dataSource');
    } else if (step === 'dataSource') {
      // 데이터 소스 선택 후 다음 단계 결정
      if (dataSource === 'gri') {
        // GRI 데이터는 GRI 카테고리 선택 단계로
        setStep('griSelect');
      } else if (dataSource === 'csv') {
        // CSV 업로드는 ESG 항목 선택 단계로
        setStep('esgSelect');
      } else {
        // 직접 추가는 ESG 항목 선택 단계로
        setStep('esgSelect');
      }
    } else if (step === 'esgSelect') {
      // ESG 항목 선택 후 데이터 테이블로
      setStep('datatable');
    } else if (step === 'griSelect') {
      // GRI 카테고리 선택 후 데이터 테이블로
      if (!selectedGriCategory) {
        alert('GRI 카테고리를 선택해주세요.');
        return;
      }
      // 선택된 GRI 카테고리의 데이터를 차트 데이터로 변환
      prepareGriChartData();
      setStep('datatable');
    } else {
      // 데이터 테이블 입력 후 저장
      handleSave();
    }
  };

  const handleBack = () => {
    if (step === 'dataSource') {
      setStep('info');
    } else if (step === 'esgSelect') {
      setStep('dataSource');
    } else if (step === 'griSelect') {
      setStep('dataSource');
    } else if (step === 'datatable') {
      if (dataSource === 'gri') {
        setStep('griSelect');
      } else {
        setStep('esgSelect');
      }
    }
  };

  // GRI 데이터를 차트 데이터로 변환하는 함수
  const prepareGriChartData = () => {
    if (!griData || !selectedGriCategory) return;

    const category = griCategories.find((cat) => cat.id === selectedGriCategory);
    if (!category) return;

    const griValue = griData.griValues[selectedGriCategory];
    if (!griValue) return;

    // 차트 제목과 설명을 GRI 카테고리 정보로 설정
    if (!chartTitle) {
      setChartTitle(`${category.name}: ${category.description}`);
    }
    if (!chartDescription) {
      setChartDescription(`GRI ${category.id} - ${category.description} 데이터`);
    }

    // 데이터 유형에 따라 차트 데이터 준비
    if (
      griValue.dataType === 'timeSeries' &&
      griValue.timeSeriesData &&
      griValue.timeSeriesData.length > 0
    ) {
      // 시계열 데이터 처리
      const newLabels = griValue.timeSeriesData.map((item) => item.year.toString());
      const newData = griValue.timeSeriesData.map((item) => Number(item.value));

      setLabels(newLabels);
      setDatasets([
        {
          label: category.description,
          data: newData,
          backgroundColor: '#3b82f6' as string,
          borderColor: '#1d4ed8' as string,
          borderWidth: 1,
          fill: false,
        },
      ]);
    } else if (
      griValue.dataType === 'numeric' &&
      griValue.numericValue !== null &&
      griValue.numericValue !== undefined
    ) {
      // 단일 숫자 데이터 처리
      setLabels([category.description]);
      setDatasets([
        {
          label: category.description,
          data: [Number(griValue.numericValue)],
          backgroundColor: '#3b82f6' as string,
          borderColor: '#1d4ed8' as string,
          borderWidth: 1,
          fill: false,
        },
      ]);
    }
  };

  const handleDataChange = useCallback(
    (newLabels: string[] | number[], newDatasets: ChartData['datasets']) => {
      setLabels(newLabels);
      setDatasets(newDatasets);
    },
    []
  );

  const handleESGChange = useCallback((value: string | null) => {
    setSelectedESG(value);
  }, []);

  // GRI 카테고리 변경 핸들러
  const handleGriCategoryChange = (categoryId: string) => {
    setSelectedGriCategory(categoryId);
  };

  // 데이터 소스 변경 핸들러
  const handleDataSourceChange = (source: 'gri' | 'direct' | 'csv') => {
    setDataSource(source);

    // GRI 선택 시 데이터 로드
    if (source === 'gri' && !griData) {
      loadGriData();
    }
  };

  function findESGCategoryByLabel(id: string): 'environment' | 'social' | 'governance' | null {
    for (const category in esgIndicators) {
      const indicators = esgIndicators[category as keyof typeof esgIndicators];
      if (indicators.some((indicator) => indicator.id === id)) {
        return category as 'environment' | 'social' | 'governance';
      }
    }
    return null; // 못 찾은 경우
  }

  const handleSave = async () => {
    if (!chartTitle) {
      alert('차트 제목을 입력해주세요');
      return;
    }

    if (dataSource !== 'gri' && !selectedESG) {
      alert('ESG 항목을 선택해주세요.');
      return;
    }

    if (
      step === 'datatable' &&
      (labels.length === 0 ||
        datasets === undefined ||
        datasets.length === 0 ||
        datasets.some((ds) => !ds || ds.data.length === 0))
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target?.result) return;
        const csvText = event.target.result as string;
        const parsedData = parseCSV(csvText);

        const dataset: ChartData['datasets'] = [];
        parsedData.data.forEach((val, index) => {
          dataset.push(
            {
              label: `${index + 1}`, // Provide a default string label
              data: val, // Use the data array
            }
          );
        });
        setLabels(parsedData.labels);
        setDatasets(dataset);
      };
      console.log(labels, datasets);
      reader.readAsText(file, "UTF-8");
      handleDataChange(labels, datasets);
    }
  }, [labels, datasets]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], },
  });

  const parseCSV = (csvText: string) => {
    const rows = csvText.split("\n").map(row => row.trim()).filter(row => row); // 줄바꿈 기준으로 분리
    const labels = Array.from({ length: rows.length }, (_, i) => i);
    const beforedata: number[][] = [];
    for (let i = 0; i < rows.length; i++) {  // 첫 번째 줄은 헤더이므로 건너뜀
      const value = rows[i].split(",").map(row => parseValue(row));
      beforedata.push(value); // 숫자로 변환
    }
    const data = beforedata[0].map((_, colIndex) =>
      beforedata.map(row => row[colIndex])
    );
    return { labels, data };
  };

  const parseValue = (value: any) => isNaN(value) ? value : Number(value);

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
          {step === 'info' && (
            <div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-title" className="text-right">제목</Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="chart-description" className="text-right">설명</Label>
                <Input
                  id="chart-description"
                  value={chartDescription}
                  onChange={(e) => setChartDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">차트 유형</Label>
                <Select
                  value={chartType}
                  onValueChange={(value) => setChartType(value as ChartType)}
                >
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
                  onValueChange={(value) => setColSpan(Number(value) as 1 | 2 | 3 | 4)}
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

          {step === 'dataSource' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center">데이터 소스 선택</h3>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={dataSource === 'gri' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center p-4 h-28"
                  onClick={() => handleDataSourceChange('gri')}
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div>GRI 데이터</div>
                </Button>
                <Button
                  variant={dataSource === 'direct' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center p-4 h-28"
                  onClick={() => handleDataSourceChange('direct')}
                >
                  <div className="text-2xl mb-2">✏️</div>
                  <div>직접 추가</div>
                </Button>
                <Button
                  variant={dataSource === 'csv' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center p-4 h-28"
                  onClick={() => handleDataSourceChange('csv')}
                >
                  <div className="text-2xl mb-2">📁</div>
                  <div>CSV 추가</div>
                </Button>
              </div>
            </div>
          )}

          {step === 'griSelect' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center">GRI 카테고리 선택</h3>

              {isLoadingGriData ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-t-2 border-gray-200 rounded-full animate-spin border-t-blue-600" />
                </div>
              ) : griDataError ? (
                <div className="p-4 text-center text-red-500">
                  {griDataError}
                  <Button variant="outline" className="mt-2" onClick={loadGriData}>
                    다시 시도
                  </Button>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <Select value={selectedGriCategory || ''} onValueChange={handleGriCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="GRI 카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {quantitativeGriCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.id} - {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedGriCategory && (
                    <div className="mt-4 p-3 border rounded-md bg-gray-50">
                      <p className="font-medium">
                        {griCategories.find((cat) => cat.id === selectedGriCategory)?.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">GRI {selectedGriCategory}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'esgSelect' && (
            <div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">ESG 항목</Label>
                <div className="col-span-3">
                  <ESGCombobox value={selectedESG} onValueChange={handleESGChange} />
                </div>
              </div>
            </div>
          )}

          {step === 'datatable' && (
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
