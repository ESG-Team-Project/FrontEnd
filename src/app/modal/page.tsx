'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ESGChartDialog } from './chartinput-form'; // dialog → chartinput으로 변경

export default function ModalPage() {
  const [chartModalOpen, setChartModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black space-y-4">
      {/* 📊 차트 추가 버튼 */}
      <Button
        onClick={() => setChartModalOpen(true)}
        className="w-1/8 px-4 py-2 bg-white text-black hover:bg-black hover:text-white border border-white rounded"
      >
        차트 추가
      </Button>

      {/* 📊 차트 추가 모달 */}
      <ESGChartDialog open={chartModalOpen} setOpen={setChartModalOpen} />
    </div>
  );
}
