'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FileInputDialog } from '@/app/modal/fileinput-form';
import { ESGChartDialog } from '@/app/modal/chartinput-form';

export default function DashboardTopBar() {
  const [locked, setLocked] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);

  // 레이아웃 잠금 상태를 로컬 스토리지에 저장
  useEffect(() => {
    const savedLocked = localStorage.getItem('dashboardLocked');
    if (savedLocked !== null) {
      setLocked(savedLocked === 'true');
    }
  }, []);

  // 레이아웃 잠금 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    localStorage.setItem('dashboardLocked', locked.toString());
  }, [locked]);

  return (
    <>
      <div className="fixed top-16 right-0 md:left-[240px] left-0 flex flex-row justify-between md:justify-end items-center px-4 py-3 border-b bg-gray-50 z-20 transition-all duration-300">
        <div className="md:hidden text-lg font-semibold">대시보드</div>
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="hidden md:flex items-center m-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700" htmlFor="layout-lock">
              <span>레이아웃 잠금</span>
              <Switch id="layout-lock" checked={locked} onCheckedChange={setLocked} />
            </label>
          </div>
          <Button 
            variant="outline" 
            className="bg-white text-xs md:text-sm px-2 md:px-4 h-8 md:h-9"
            onClick={() => setChartModalOpen(true)}
          >
            차트 추가
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-xs md:text-sm px-2 md:px-4 h-8 md:h-9 ml-2"
            onClick={() => setFileModalOpen(true)}
          >
            파일 선택
          </Button>
        </div>
      </div>

      {/* 모달 다이얼로그 */}
      <FileInputDialog open={fileModalOpen} setOpen={setFileModalOpen} />
      <ESGChartDialog open={chartModalOpen} setOpen={setChartModalOpen} />
    </>
  );
} 