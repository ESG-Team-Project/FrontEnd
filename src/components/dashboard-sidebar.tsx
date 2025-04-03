'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  User,
  Building,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { TbChartDonut } from "react-icons/tb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { SidebarGroupContent } from './ui/sidebar';
import api from '@/lib/api';
import { UserInfo } from '@/types/user';
import { ESGChartDialog } from '@/app/modal/chartinput-form';
import { useAtom } from 'jotai';
import { layoutLockedAtom, sidebarOpenAtom } from '@/lib/atoms';
import clsx from 'clsx';

export default function DashboardSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isLayoutLocked] = useAtom(layoutLockedAtom);
  const [isMobileOpen] = useAtom(sidebarOpenAtom);

  const openModal = () => setIsModalOpen(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const data = await api.getCurrentUser();
        setUserInfo(data);
        setError(null);
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
        setError('정보 로드 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const getUserInitials = () => {
    if (!userInfo?.name) return '?';
    
    const nameParts = userInfo.name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return userInfo.name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <aside 
        className={clsx(
          "fixed md:top-16 top-14 left-0",
          "h-[calc(100vh-56px)] md:h-[calc(100vh-64px)]",
          "bg-white p-2 md:p-3 overflow-y-auto z-30 border-r",
          "transition-all duration-300 ease-in-out",
          isLayoutLocked ? "md:w-16" : "md:w-60",
          "md:translate-x-0 md:opacity-100",
          isMobileOpen 
            ? "w-60 translate-x-0 opacity-100" 
            : "w-0 -translate-x-full opacity-0"
        )}
      >
        <div className={clsx(
          "flex items-center pb-2 border-b p-2",
          isLayoutLocked ? "justify-center" : "justify-between"
        )}>
          {loading ? (
            <div className="flex items-center justify-center w-full py-2">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className={clsx("py-2", isLayoutLocked ? "hidden" : "text-left text-red-500")}>
              <p className="text-xs">{error}</p>
            </div>
          ) : userInfo ? (
            <>
              <div className={clsx(
                  "flex-shrink-0 flex items-center justify-center",
                  isLayoutLocked ? "w-full h-10" : "w-10 h-10"
              )}>
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className={clsx("text-right overflow-hidden", isLayoutLocked && "hidden")}>
                {userInfo.companyName && (
                  <div className="flex items-center justify-end mb-0.5">
                    <Building className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
                    <p className="text-xs text-gray-600 truncate">{userInfo.companyName}</p>
                  </div>
                )}
                <div className="flex items-center justify-end">
                  <User className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
                  <p className="text-sm font-medium truncate">{userInfo.name}</p>
                </div>
                {userInfo.department && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate text-right">{userInfo.department}</p>
                )}
              </div>
            </>
          ) : (
            <div className={clsx("py-2", isLayoutLocked ? "hidden" : "text-left")}>
              <p className="text-xs text-gray-500">로그인 정보가 없습니다</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <Collapsible className="w-full group/collapsible">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className={clsx(
                  "w-full py-1 h-auto", 
                  isLayoutLocked ? "justify-center" : "justify-start"
                )}
              >
                <PieChart className={clsx("w-4 h-4", !isLayoutLocked && "mr-2")} />
                <strong className={clsx("block my-1 text-sm", isLayoutLocked && "hidden")}>차트추가</strong>
                <ChevronDown className={clsx("ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180", isLayoutLocked && "hidden")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className={clsx(isLayoutLocked && "hidden")}>
              <SidebarGroupContent>
                <strong className="block my-1 text-xs">선</strong>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={openModal} className="group">
                    <ChartLine className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartSpline className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartNoAxesCombined className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>

              <SidebarGroupContent>
                <strong className="block my-1 text-xs">영역</strong>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={openModal} className="group">
                    <ChartArea className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
              
              <SidebarGroupContent>
                <strong className="block my-1 text-xs">열</strong>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={openModal} className="group">
                    <ChartColumnBig className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartColumnStacked className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
              
              <SidebarGroupContent>
                <strong className="block my-1 text-xs">막대</strong>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={openModal} className="group">
                    <ChartBarBig className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <ChartBarStacked className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
              
              <SidebarGroupContent>
                <strong className="block my-1 text-xs">원형</strong>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={openModal} className="group">
                    <ChartPie className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                  <button type="button" onClick={openModal} className="group">
                    <TbChartDonut className="w-8 h-8 group-hover:text-blue-500" />
                  </button>
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>

      {isModalOpen && <ESGChartDialog open={isModalOpen} setOpen={setIsModalOpen} />}
    </>
  );
}
