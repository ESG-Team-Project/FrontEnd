'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ESGCombobox } from './combobox'; // 분리한 combobox 가져오기

export function ESGChartDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-lg p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">차트 추가</DialogTitle>
          <DialogClose
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
            onClick={() => setOpen(false)}
          ></DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          {/* 차트 제목 입력 */}
          <div>
            <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700">
              차트 제목
            </label>
            <input
              id="chart-title"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="차트 제목을 입력하세요"
            />
          </div>

          {/* ESG 항목 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ESG 항목</label>
            <ESGCombobox />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="w-1/8 mt-4 bg-black text-white hover:bg-white hover:text-black border border-black px-4 py-2 rounded"
            onClick={() => setOpen(false)} // 닫기 버튼 추가
          >
            다음
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
