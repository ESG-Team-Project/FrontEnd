'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  ChartBarStacked
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { SidebarGroupContent } from './ui/sidebar';

export default function DashboardSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="w-[260px] border-r flex flex-col h-[700px] bg-white p-4 overflow-y-auto">
        {/* 사용자 정보 영역 */}
        <div className="flex flex-col items-center gap-2 pb-4 border-b">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/user-icon.png" alt="User" />
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
                  <button onClick={openModal}>
                    <ChartLine className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartSpline className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartNoAxesCombined className="w-10 h-10" />
                  </button>
                </div>
              </SidebarGroupContent>

              <SidebarGroupContent>
                <strong className="block my-2 text-sm">영역</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={openModal}>
                    <ChartArea className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartArea className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartArea className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartArea className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartArea className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartArea className="w-10 h-10" />
                  </button>
                </div>
              </SidebarGroupContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">열</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={openModal}>
                    <ChartColumnBig className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartColumnStacked className="w-10 h-10" />
                  </button>
                </div>
              </SidebarGroupContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">막대</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={openModal}>
                    <ChartBarBig className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartBarStacked className="w-10 h-10" />
                  </button>
                </div>
              </SidebarGroupContent>
              <SidebarGroupContent>
                <strong className="block my-2 text-sm">원형</strong>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={openModal}>
                    <ChartPie className="w-10 h-10" />
                  </button>
                  <button onClick={openModal}>
                    <ChartPie className="w-10 h-10" />
                  </button>
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 bg-white rounded shadow-lg">
            <h2 className="text-lg font-bold">모달 제목</h2>
            <p>모달 내용입니다.</p>
            <button onClick={closeModal} className="px-4 py-2 mt-4 text-white bg-blue-500 rounded">
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
