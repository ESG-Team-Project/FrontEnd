'use client';
import { Button } from '@/components/ui/button';
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
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ESGCombobox, esgIndicators } from './combobox';
import DataTable from './datatable';
import { useDashboard } from '@/contexts/dashboard-context';
import { griCategories } from '@/data/griCategories';
import api from '@/lib/api';
import { getCompanyGriDataFormatted } from '@/lib/api/gri';
import type {
  ApiChartData,
  ApiChartDataItem,
  ApiChartStyle,
  ChartData,
  ChartType,
} from '@/types/chart';
import type { CompanyGRICategoryValue, CompanyGRIData } from '@/types/companyGriData';

// 단계 타입 정의
type ChartStep = 'info' | 'dataSource' | 'esgSelect' | 'datatable' | 'griSelect';
type DataSource = 'gri' | 'direct';

// 단계 관리 훅
function useChartStepManager(initialStep: ChartStep = 'info', setSaveError?: (error: string | null) => void) {
  const [step, setStep] = useState<ChartStep>(initialStep);
  const [dataSource, setDataSource] = useState<DataSource>('direct');
  
  // 다음 단계로 이동하는 함수
  const goToNextStep = useCallback((
    currentSelectedGriCategory: string | null = null,
    prepareGriChartDataFn?: () => void
  ) => {
    // 오류 메시지 초기화
    setSaveError?.(null);
    
    if (step === 'info') {
      setStep('dataSource');
    } else if (step === 'dataSource') {
      if (dataSource === 'gri') {
        setStep('griSelect');
      } else {
        setStep('esgSelect');
      }
    } else if (step === 'esgSelect') {
      setStep('datatable');
    } else if (step === 'griSelect') {
      if (!currentSelectedGriCategory) {
        setSaveError?.('GRI 카테고리를 선택해주세요.');
        return false;
      }
      // GRI 차트 데이터 준비 함수 호출
      if (prepareGriChartDataFn) {
        prepareGriChartDataFn();
      }
      setStep('datatable');
    }
    return true;
  }, [step, dataSource, setSaveError]);
  
  // 이전 단계로 이동하는 함수
  const goToPreviousStep = useCallback(() => {
    // 오류 메시지 초기화
    setSaveError?.(null);
    
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
  }, [step, dataSource, setSaveError]);
  
  // 단계별 다음 버튼 텍스트 결정
  const getNextButtonText = useCallback(() => {
    return step === 'datatable' ? '저장' : '다음';
  }, [step]);
  
  // 특정 단계로 직접 이동
  const goToStep = useCallback((newStep: ChartStep) => {
    setStep(newStep);
  }, []);

  // CSV 선택 시 처리 수정
  useEffect(() => {
    if (step === 'dataSource' && dataSource) {
      if (dataSource === 'gri') {
        goToStep('griSelect');
      } else if (dataSource === 'direct') {
        goToStep('esgSelect');
      }
    }
  }, [step, dataSource]);
  
  return {
    step,
    dataSource,
    setDataSource,
    goToNextStep,
    goToPreviousStep,
    getNextButtonText,
    goToStep,
  };
}

interface ESGChartDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChartAdd?: (chart: ChartData) => void;
}

export function ESGChartDialog({ open, setOpen, onChartAdd }: ESGChartDialogProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // 단계 관리 훅 사용
  const {
    step,
    dataSource,
    setDataSource,
    goToNextStep,
    goToPreviousStep,
    getNextButtonText,
    goToStep,
  } = useChartStepManager('info', setSaveError);
  
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartDescription, setChartDescription] = useState('');
  const [colSpan, setColSpan] = useState<1 | 2 | 3 | 4>(1);
  const [selectedESG, setSelectedESG] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[] | number[]>([]);
  const [datasets, setDatasets] = useState<ChartData['datasets']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const prevDataLength = useRef({ labels: 0, datasets: 0 });

  // GRI 데이터 관련 상태
  const { companyId } = useDashboard(); // 회사 ID 가져오기
  const [griData, setGriData] = useState<CompanyGRIData | null>(null);
  const [isLoadingGriData, setIsLoadingGriData] = useState(false);
  const [griDataError, setGriDataError] = useState<string | null>(null);
  const [selectedGriCategory, setSelectedGriCategory] = useState<string | null>(null);

  // 수치화된 GRI 카테고리만 필터링
  const quantitativeGriCategories = useMemo(() => {
    return griCategories.filter(
      (category) =>
        category.isQuantitative ||
        category.defaultDataType === 'timeSeries'
    );
  }, []); // 의존성 없음 - 한 번만 계산

  // 데이터 변경 시 테이블 키 업데이트
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
      const data = await getCompanyGriDataFormatted();
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

  // 데이터 소스 변경 핸들러
  const handleDataSourceChange = useCallback((source: 'gri' | 'direct') => {
    setDataSource(source);
  }, [setDataSource]);

  // ESG 항목 변경 핸들러
  const handleESGChange = useCallback((value: string | null) => {
    setSelectedESG(value);
  }, []);

  // GRI 카테고리 변경 핸들러
  const handleGriCategoryChange = useCallback((value: string) => {
    setSelectedGriCategory(value);
  }, []);

  // GRI 차트 데이터 준비
  const prepareGriChartData = useCallback(() => {
    if (!griData || !selectedGriCategory) {
      setSaveError('GRI 카테고리를 선택해주세요.');
      return;
    }

    // GRI 카테고리에 해당하는 데이터 가져오기
    const categoryData = griData.griValues[selectedGriCategory];
    if (!categoryData) {
      setSaveError('선택한 GRI 카테고리에 데이터가 없습니다.');
      return;
    }

    // 데이터 유형에 따라 레이블과 데이터셋 생성
    if (categoryData.dataType === 'timeSeries' && categoryData.timeSeriesData && categoryData.timeSeriesData.length > 0) {
      // 시계열 데이터 처리
      const labels = categoryData.timeSeriesData.map(item => item.year.toString());
      const datasets = [
        {
          label: selectedGriCategory,
          data: categoryData.timeSeriesData.map(item => {
            // 문자열이면 숫자로 변환, 변환 불가능하면 0으로 대체
            if (typeof item.value === 'string') {
              const num = Number(item.value);
              return Number.isNaN(num) ? 0 : num;
            }
            // 이미 숫자라면 그대로 사용
            return item.value as number;
          }) as number[],
        },
      ];

      setLabels(labels);
      setDatasets(datasets);
      goToStep('datatable');
    } else {
      // 텍스트 데이터나 데이터가 없는 경우
      setSaveError('이 카테고리는 차트로 표시할 수 있는 데이터가 없습니다.');
    }
  }, [griData, selectedGriCategory, goToStep, setSaveError]);

  // 데이터 변경 핸들러
  const handleDataChange = useCallback((newLabels: string[] | number[], newDatasets: ChartData['datasets']) => {
    setLabels(newLabels);
    setDatasets(newDatasets);
  }, []);

  // 폼 초기화 함수
  const resetForm = useCallback(() => {
    setChartTitle('');
    setChartDescription('');
    setChartType('bar');
    setColSpan(1);
    setSelectedESG(null);
    setLabels([]);
    setDatasets([]);
    setSaveError(null);
    goToStep('info');
  }, [goToStep]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    // 기존 오류 메시지 초기화
    setSaveError(null);

    if (!chartTitle) {
      setSaveError('차트 제목을 입력해주세요');
      return;
    }

    if (dataSource !== 'gri' && !selectedESG) {
      setSaveError('ESG 항목을 선택해주세요.');
      return;
    }

    if (
      labels.length === 0 ||
      !datasets ||
      datasets.length === 0 ||
      datasets.some((ds) => !ds || ds.data.length === 0)
    ) {
      setSaveError('차트 데이터를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    const newChart: ChartData = {
      id: uuidv4(),
      title: chartTitle,
      description: chartDescription,
      chartType: chartType,
      colSpan: colSpan,
      esg: selectedESG ?? undefined,
      labels: labels,
      datasets: datasets,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // axios를 사용하여 API 호출
      const axiosInstance = (await import('@/lib/api/core/axios')).default;
      const response = await axiosInstance.post('/charts', newChart, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (onChartAdd) {
        onChartAdd(response.data);
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('차트 저장 실패:', error);
      let errorMessage = '차트 저장 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      
      // alert 대신 오류 상태 업데이트
      setSaveError(errorMessage);
      // 오류 발생 시 모달은 닫지 않고 유지 (사용자가 수정할 수 있도록)
    } finally {
      setIsLoading(false);
    }
  }, [
    chartTitle, 
    dataSource, 
    selectedESG, 
    labels, 
    datasets, 
    chartDescription, 
    chartType, 
    colSpan, 
    onChartAdd, 
    setOpen, 
    resetForm, 
    setSaveError,
    selectedGriCategory
  ]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    // 오류 메시지 초기화
    setSaveError(null);
    
    if (step === 'datatable') {
      // 데이터 테이블 입력 후 저장
      handleSave();
    } else {
      // 다음 단계로 이동
      goToNextStep(selectedGriCategory, prepareGriChartData);
    }
  }, [step, selectedGriCategory, goToNextStep, prepareGriChartData, setSaveError, handleSave]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900 w-auto sm:min-w-[500px] sm:max-w-[80vw]">
        <DialogDescription>차트를 설정하세요</DialogDescription>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">차트 추가</DialogTitle>
          <DialogClose
            className="absolute text-gray-500 top-2 right-2 hover:text-black"
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        {/* 오류 메시지 표시 영역 - 모든 단계에서 표시되도록 최상단에 배치 */}
        {saveError && (
          <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-md text-red-600">
            <p className="text-sm font-medium">저장 오류: {saveError}</p>
            <p className="text-xs mt-1">데이터를 수정한 후 다시 시도해주세요.</p>
          </div>
        )}

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
              <div className="grid grid-cols-2 gap-4">
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
            <div className="mt-4">
              <DataTable
                key={tableKey}
                initialLabels={labels}
                initialDatasets={datasets}
                onDataChange={handleDataChange}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {step === 'datatable' && (
            <Button variant="outline" onClick={goToPreviousStep}>
              이전
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={isLoading}
          >
            {getNextButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
