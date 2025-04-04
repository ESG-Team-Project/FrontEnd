'use client';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { ESGCombobox } from './combobox'; // ESG 항목 선택 컴포넌트
import DataTable from './datatable'; // 데이터 입력 테이블 컴포넌트
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Select 관련 컴포넌트 추가
import { v4 as uuidv4 } from 'uuid';
import { ChartType, ChartData } from '@/types/chart'; // ChartDataset 임포트 제거
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

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
  const [selectedESG, setSelectedESG] = useState<string | null>(null); // ESG 항목 상태 추가
  const [labels, setLabels] = useState<string[]>([]); // labels 상태 추가
  const [datasets, setDatasets] = useState<ChartData['datasets']>([]); // datasets 상태 타입 수정
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [csvData, setCsvData] = useState<any[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);
  useEffect(() => {
    // Web Worker 초기화
    const csvWorker = new Worker(new URL('../../worker/csvWorker.ts', import.meta.url), {
      type: 'module',
    });
    csvWorker.onmessage = event => {
      setCsvData(event.data); // CSV 데이터 업데이트
    };
    setWorker(csvWorker);

    return () => {
      csvWorker.terminate(); // 컴포넌트 언마운트 시 종료
    };
  }, []);
  const handleFile = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && worker) {
      worker.postMessage(file); // Web Worker로 파일 전송
    }
    const dataset: ChartData['datasets'] = [];
    console.log(csvData);
  };

  const handleNext = () => {
    if (step === 'combobox') {
      setStep('datatable'); // 다음 단계로 전환
    } else {
      handleSave();
    }
  };

  // 이전 단계로 돌아가는 함수 추가
  const handleBack = () => {
    setStep('combobox');
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

  const handleSave = async () => {
    // async 추가
    if (!chartTitle) {
      alert('차트 제목을 입력해주세요');
      return;
    }
    if (!selectedESG) {
      alert('ESG 항목을 선택해주세요.');
      return;
    }
    // 데이터 유효성 검사 활성화
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

    setIsLoading(true); // 로딩 시작

    // 새 차트 객체 생성 시 상태 값 사용
    const newChart: ChartData = {
      id: uuidv4(),
      title: chartTitle,
      description: chartDescription,
      type: chartType,
      colSpan: colSpan,
      esg: selectedESG, // ESG 항목 추가 (null 아님을 위에서 확인)
      labels: labels, // 상태에서 가져온 labels 사용
      datasets: datasets, // 상태에서 가져온 datasets 사용
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // 백엔드 API 호출 (엔드포인트는 예시)
      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChart),
      });

      if (!response.ok) {
        // 오류 처리 (예: 사용자에게 알림)
        throw new Error(`API 오류: ${response.statusText}`);
      }

      const savedChart = await response.json(); // 저장된 차트 데이터 (선택적)
      console.log('차트 저장 성공:', savedChart);

      // 부모 컴포넌트로 전달
      if (onChartAdd) {
        onChartAdd(savedChart); // 저장된 데이터 전달 (백엔드 응답 사용)
      }

      // 폼 초기화 및 닫기
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('차트 저장 실패:', error);
      // 사용자에게 오류 알림 (예: alert 또는 toast 메시지)
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
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => handleFile(acceptedFiles),
    accept: { 'text/csv': ['.csv'] },
  });
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
        <DialogDescription>test</DialogDescription>
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
                  onChange={e => setChartTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* ESG 항목 선택 */}
              <div className="grid items-center grid-cols-4 gap-4">
                <Label className="text-right">ESG 항목</Label>
                <div className="col-span-3">
                  {/* ESGCombobox에 콜백 및 값 전달 */}
                  <ESGCombobox value={selectedESG} onValueChange={handleESGChange} />
                </div>
              </div>

              {/* 차트 설명 입력 */}
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

              {/* 차트 유형 선택 */}
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

              {/* 차트 크기 선택 */}
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
          {step === 'datatable' && (
            <div>
              {/* 데이터 입력 테이블에 콜백 및 초기값 전달 */}
              <DataTable
                onDataChange={handleDataChange}
                initialLabels={labels}
                initialDatasets={datasets}
              />
            </div>
          )}
        </div>

        {/* 버튼 컨테이너 스타일 수정 및 이전 버튼 추가 */}
        <div className="flex justify-end mt-4 space-x-2">
          {step === 'datatable' && (
            <Button
              variant="outline" // 이전 버튼 스타일
              onClick={handleBack}
              disabled={isLoading} // 로딩 중 비활성화
            >
              이전
            </Button>
          )}
          <Button
            className="px-4 py-2 text-white bg-black border border-black rounded hover:bg-white hover:text-black"
            onClick={handleNext}
            disabled={isLoading} // 로딩 중 비활성화
          >
            {isLoading ? '저장 중...' : step === 'combobox' ? '다음' : '완료'} {/* 로딩 텍스트 */}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
