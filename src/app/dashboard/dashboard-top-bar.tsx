'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileInputDialog } from '@/app/modal/fileinput-form';
import { ESGChartDialog } from '@/app/modal/chartinput-form';
import { useAtom } from 'jotai';
import { layoutLockedAtom, sidebarOpenAtom } from '@/lib/atoms';
import { PanelLeftClose, PanelRightClose, Menu } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardTopBar() {
  const [isLayoutLocked, setLayoutLocked] = useAtom(layoutLockedAtom);
  const [, setSidebarOpen] = useAtom(sidebarOpenAtom);

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);

  const toggleLayoutLock = () => {
    setLayoutLocked((prev) => {
      const nextLocked = !prev;
      if (nextLocked) {
        setSidebarOpen(false);
      }
      return nextLocked;
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <div className={clsx(
        "fixed top-16 right-0 z-20",
        "flex flex-row justify-between items-center px-4 py-3 border-b bg-gray-50",
        "transition-all duration-300 ease-in-out",
        isLayoutLocked 
          ? "md:left-16 md:w-[calc(100%-theme(space.16))] left-0 w-full"
          : "md:left-60 md:w-[calc(100%-theme(space.60))] left-0 w-full"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleLayoutLock} 
          className="mr-2 hidden md:inline-flex"
        >
          {isLayoutLocked ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Layout Lock</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="mr-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <div className="md:hidden text-lg font-semibold">대시보드</div>
        <div className="flex items-center space-x-2 md:space-x-3">
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

      <FileInputDialog open={fileModalOpen} setOpen={setFileModalOpen} />
      <ESGChartDialog open={chartModalOpen} setOpen={setChartModalOpen} />
    </>
  );
} 