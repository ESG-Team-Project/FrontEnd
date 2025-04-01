'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  PieChart,
  ChartLine,
  ChartArea,
  ChartColumnBig,
  ChartBarBig,
  ChartPie,
  ChartSpline,
  ChartNoAxesCombined,
  ChartColumnStacked,
  ChartBarStacked,
} from 'lucide-react';
import { TbChartDonut } from "react-icons/tb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { SidebarGroupContent } from './ui/sidebar';
import { ESGChartDialog } from '@/app/modal/chartinput-form';

export default function DashboardSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="w-[260px] h-[700px] flex flex-col bg-white p-4 min-h-full">
        {/* 사용자 정보 영역 */}
        <div className="flex flex-col items-center gap-2 pb-4 border-b">
          <Avatar className="w-16 h-16">
            <AvatarImage src="http://localhost:3000/mypage/account" alt="User" />
            <AvatarFallback>유저</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">회사명</p>
            <p className="text-base font-bold">사용자명</p>
          </div>
        </div>

        {/* 차트추가 드롭다운 */}
        <div className="flex items-center justify-between py-4 border-b">
          <Collapsible className="w-full group/collapsible">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="justify-start w-full ">
                <PieChart className="w-4 h-4 mr-2" />
                <strong className="block my-2 text-base">차트추가</strong>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">선</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={openModal} className="group">
                    <ChartLine className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartSpline className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartNoAxesCombined className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>

              <SidebarGroupContent>
                <strong className="block my-2 text-sm">영역</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={openModal} className="group">
                    <ChartArea className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                 
                </div>
              </SidebarGroupContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">열</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={openModal} className="group">
                    <ChartColumnBig className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartColumnStacked className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">막대</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={openModal} className="group">
                    <ChartBarBig className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartBarStacked className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">원형</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={openModal} className="group">
                    <ChartPie className="w-10 h-10 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <TbChartDonut className="w-11 h-11 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && <ESGChartDialog open={isModalOpen} setOpen={setIsModalOpen} />}
    </>
  );
}
