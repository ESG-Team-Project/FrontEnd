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
import { mobileOpenAtom } from '@/lib/atoms';
import MobileToggle from './MobileToggle';

export default function DashboardSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useAtom(mobileOpenAtom);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleMobileSidebar = () => setIsMobileOpen(prev => !prev);

  // 사용자 정보 조회
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

  // 사용자 이니셜 생성 (아바타 폴백용)
  const getUserInitials = () => {
    if (!userInfo?.name) return '?';
    
    // 이름에서 첫 글자 또는 첫 두 글자 추출
    const nameParts = userInfo.name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return userInfo.name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <MobileToggle />
      
      <div className={`
        fixed md:top-16 top-14 left-0 
        h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] 
        bg-white p-2 md:p-3 overflow-y-auto z-30 border-r
        transition-all duration-300
        ${isMobileOpen ? 'w-[240px] opacity-100 translate-x-0' : 'w-0 md:w-[240px] opacity-0 md:opacity-100 -translate-x-full md:translate-x-0'}
      `}>
        {/* 사용자 정보 영역 */}
        <div className="flex flex-col items-center gap-1 pb-2 border-b">
          {loading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              <p className="mt-1 text-xs text-gray-500">정보 로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-2">
              <p className="text-xs">{error}</p>
            </div>
          ) : userInfo ? (
            <>
              <div className="w-14 h-14 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-center mt-1">
                {userInfo.companyName && (
                  <div className="flex items-center justify-center mb-0.5">
                    <Building className="w-3 h-3 mr-1 text-gray-500" />
                    <p className="text-xs text-gray-600">{userInfo.companyName}</p>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <User className="w-3 h-3 mr-1 text-gray-500" />
                  <p className="text-sm font-medium">{userInfo.name}</p>
                </div>
                {userInfo.department && (
                  <p className="text-2xs text-gray-500 mt-0.5">{userInfo.department}</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">로그인 정보가 없습니다</p>
            </div>
          )}
        </div>

        {/* 차트추가 드롭다운 */}
        <div className="flex items-center justify-between py-2 border-b">
          <Collapsible className="w-full group/collapsible">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="justify-start w-full py-1 h-auto">
                <PieChart className="w-4 h-4 mr-2" />
                <strong className="block my-1 text-sm">차트추가</strong>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
      </div>

      {/* 모달 */}
      {isModalOpen && <ESGChartDialog open={isModalOpen} setOpen={setIsModalOpen} />}
    </>
  );
}

// 사이드바 그룹 내부 컨텐츠 스타일링 컴포넌트
function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-4 mr-2 my-2 p-2 rounded-md bg-gray-50">
      {children}
    </div>
  );
}
