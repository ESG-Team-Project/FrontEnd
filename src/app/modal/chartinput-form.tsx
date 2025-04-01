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

export function ESGChartDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [step, setStep] = useState<'combobox' | 'datatable'>('combobox'); // 현재 단계 상태

  const handleNext = () => {
    if (step === 'combobox') {
      setStep('datatable'); // 다음 단계로 전환
    } else {
      setOpen(false); // 다이얼로그 닫기
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
              <div>
                <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700">
                  차트 제목
                </label>
                <input
                  id="chart-title"
                  type="text"
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="차트 제목을 입력하세요"
                />
              </div>

              {/* ESG 항목 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ESG 항목</label>
                <ESGCombobox />
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
