'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Select 관련 컴포넌트 추가
import { useDashboard } from '@/contexts/dashboard-context'; // 대시보드 컨텍스트 추가
import { griCategories } from '@/data/griCategories'; // GRI 카테고리 데이터 추가
import api from '@/lib/api'; // API 호출을 위한 라이브러리
import { getCompanyGriData } from '@/services/api/gri-service'; // GRI 데이터 가져오는 함수 추가
import type {
  ApiChartData,
  ApiChartDataItem,
  ApiChartStyle,
  ChartData,
  ChartType,
} from '@/types/chart'; // 타입 임포트를 type으로 변경
import type { CompanyGRICategoryValue, CompanyGRIData } from '@/types/companyGriData'; // GRI 데이터 타입 추가
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ESGCombobox, esgIndicators } from './combobox'; // ESG 항목 선택 컴포넌트
import DataTable from './datatable'; // 데이터 입력 테이블 컴포넌트

interface ESGChartDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChartAdd?: (chart: ChartData) => void; // 차트 추가 콜백
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
  const [labels, setLabels] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<ChartData['datasets']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ label: string; key: number; unit?: string }[]>([]);

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

  const handleNext = () => {
    if (step === 'info') {
      // 기본 정보 입력 후 데이터 소스 선택 단계로
      setStep('dataSource');
    } else if (step === 'dataSource') {
      // 데이터 소스 선택 후 다음 단계 결정
      if (dataSource === 'gri') {
        // GRI 데이터는 GRI 카테고리 선택 단계로
        setStep('griSelect');
      } else {
        // 직접 추가나 CSV는 ESG 항목 선택 단계로
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

  // 이전 단계로 돌아가는 함수 수정
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

  // 데이터 테이블 변경 콜백 (DataTable에서 호출)
  const handleDataChange = useCallback(
    (newLabels: string[], newDatasets: ChartData['datasets']) => {
      setLabels(newLabels);
      setDatasets(newDatasets);
    },
    []
  );

  // ESG 항목 변경 콜백 (ESGCombobox에서 호출)
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
    // 유효성 검사 - 차트 제목
    if (!chartTitle) {
      alert('차트 제목을 입력해주세요');
      return;
    }

    // GRI가 아니라면 ESG 항목 필요
    if (dataSource !== 'gri' && !selectedESG) {
      alert('ESG 항목을 선택해주세요.');
      return;
    }

    // 데이터 유효성 검사
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

    setIsLoading(true); // 로딩 시작

    // 서버 API 형식에 맞게 데이터 준비
    const category =
      dataSource === 'gri'
        ? 'G'
        : (findESGCategoryByLabel(selectedESG as string)
            ?.charAt(0)
            .toUpperCase() ?? 'E');

    // labels와 datasets.data를 API 형식으로 변환
    const formattedData: ApiChartDataItem[] = labels.map((label, index) => {
      const value = datasets?.[0]?.data?.[index] || 0;
      return {
        label,
        value,
        unit: '', // 필요에 따라 단위 추가
        timestamp: new Date().toISOString(), // 현재 시간으로 설정
      };
    });

    // 스타일 속성 설정
    const style: ApiChartStyle = {
      backgroundColor: datasets?.[0]?.backgroundColor || '#3b82f6',
      borderColor: datasets?.[0]?.borderColor || '#1d4ed8',
      borderWidth: datasets?.[0]?.borderWidth || 1,
      tension: datasets?.[0]?.tension || 0.4,
    };

    try {
      // 백엔드 API 호출 - API 스웨거 형식에 맞게 수정
      const chartData: Partial<ApiChartData> = {
        title: chartTitle,
        description: chartDescription,
        category,
        indicator: selectedESG,
        chartGrid: colSpan,
        data: formattedData,
        chartType: chartType,
        style,
      };

      const response = await api.chart.createChart(chartData);

      if (!response || !response.id) {
        // 오류 처리
        throw new Error('API 응답 오류: 차트 ID가 반환되지 않았습니다.');
      }

      console.log('차트 저장 성공:', response);

      // 부모 컴포넌트로 전달
      if (onChartAdd) {
        // 반환된 API 데이터를 ChartData 형식으로 변환
        const transformedChart: ChartData = {
          id: String(response.id),
          title: response.title,
          description: response.description,
          chartType: response.chartType.toLowerCase() as ChartType,
          category: response.category,
          labels: response.data.map((item) => item.label),
          datasets: [
            {
              label: response.indicator,
              data: response.data.map((item) => item.value),
              backgroundColor: response.style?.backgroundColor,
              borderColor: response.style?.borderColor,
              borderWidth: response.style?.borderWidth,
              fill: response.chartType.toLowerCase() === 'area',
              tension: response.style?.tension,
            },
          ],
          colSpan: response.chartGrid || 1,
        };

        onChartAdd(transformedChart);
      }

      // 폼 초기화 및 닫기
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('차트 저장 실패:', error);
      // 사용자에게 오류 알림
      alert('차트 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const resetForm = () => {
    setChartTitle('');
    setChartDescription('');
    setChartType('bar');
    setColSpan(1);
    setSelectedESG(null); // ESG 항목 초기화
    setLabels([]); // labels 초기화
    setDatasets([]); // datasets 초기화
  };

  // 차트 타입별 샘플 데이터 생성 함수 리팩토링 (더 이상 사용되지 않을 수 있으므로 주석 처리 또는 삭제 가능)
  /*
  const getSampleData = (type: ChartType): { labels?: string[], datasets?: ChartData['datasets'] } => {
    switch (type) {
      case 'bar':
        return {
          labels: ['카테고리1', '카테고리2', '카테고리3'],
          datasets: [
            {
              label: '샘플 데이터', // label 추가
              data: [65, 78, 82],    // data로 변경
              backgroundColor: ['blue', 'green', 'purple'] // backgroundColor로 변경
            }
          ]
        };
      case 'line':
        return {
          labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
          datasets: [
            {
              label: 'Dataset 1', // label로 변경
              data: [65, 59, 80, 81, 56, 55] // data로 변경
            },
            {
              label: 'Dataset 2', // label로 변경
              data: [28, 48, 40, 19, 86, 27] // data로 변경
            }
          ]
        };
      case 'pie':
      case 'donut': // donut 타입 추가
        return {
          labels: ['항목 1', '항목 2', '항목 3'], // labels 추가
          datasets: [
            {
              label: '샘플 데이터', // label 추가
              data: [45, 30, 25],    // data로 변경 (숫자형)
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] // 배경색 추가
            }
          ]
        };
      case 'area': // area 타입 추가
        return {
          labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
          datasets: [
            {
              label: '샘플 데이터', // label 추가
              data: [30, 45, 40, 55, 60, 65], // data로 변경
              borderColor: 'rgb(75, 192, 192)', // borderColor 추가
              backgroundColor: 'rgba(75, 192, 192, 0.2)', // backgroundColor 추가
              fill: true // fill 속성 추가
            }
          ]
        };
      default:
        // 모든 타입에 대해 처리했는지 확인 (never 타입 활용)
        const exhaustiveCheck: never = type;
        console.error(`Unhandled chart type: ${exhaustiveCheck}`);
        return {};
    }
  };
  */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900 w-auto sm:min-w-[500px] sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">차트 추가</DialogTitle>
          <DialogClose
            className="absolute text-gray-500 top-2 right-2 hover:text-black"
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        <div className="space-y-4">
          {/* 차트 기본 정보 입력 단계 */}
          {step === 'info' && (
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

              {/* 차트 크기 선택 */}
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

          {/* 데이터 소스 선택 단계 */}
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

          {/* GRI 카테고리 선택 단계 */}
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

          {/* ESG 항목 선택 단계 (GRI 데이터가 아닐 경우에만) */}
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

          {/* 데이터 테이블 단계 */}
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

        {/* 버튼 컨테이너 */}
        <div className="flex justify-between mt-4 space-x-2">
          {step !== 'info' && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading || isLoadingGriData}>
              이전
            </Button>
          )}
          <div className="flex-1" />
          <Button
            className="px-4 py-2 text-white bg-black border border-black rounded hover:bg-white hover:text-black"
            onClick={handleNext}
            disabled={
              isLoading || isLoadingGriData || (step === 'griSelect' && !selectedGriCategory)
            }
          >
            {isLoading ? '저장 중...' : step === 'datatable' ? '완료' : '다음'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
