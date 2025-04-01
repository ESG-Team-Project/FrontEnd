'use client';

import React, { useState, useEffect } from 'react';
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
  ChartBarStacked,
  User,
  Building,
  Loader2,
} from 'lucide-react';
import { TbChartDonut } from "react-icons/tb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { SidebarGroupContent } from './ui/sidebar';
import api from '@/lib/api';
import { UserInfo } from '@/types/user';
import { ESGChartDialog } from '@/app/modal/chartinput-form';

export default function DashboardSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      <div className="w-[260px] h-[700px] flex flex-col bg-white p-4 min-h-full">
        {/* 사용자 정보 영역 */}
        <div className="flex flex-col items-center gap-2 pb-4 border-b">
          {loading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">정보 로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              <p className="text-sm">{error}</p>
            </div>
          ) : userInfo ? (
            <>
              <Avatar className="w-16 h-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.name}`} alt={userInfo.name} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                {userInfo.companyName && (
                  <div className="flex items-center justify-center mb-1">
                    <Building className="w-3 h-3 mr-1 text-gray-500" />
                    <p className="text-sm text-gray-600">{userInfo.companyName}</p>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <User className="w-3 h-3 mr-1 text-gray-500" />
                  <p className="text-base font-medium">{userInfo.name}</p>
                </div>
                {userInfo.department && (
                  <p className="text-xs text-gray-500 mt-1">{userInfo.department}</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">로그인 정보가 없습니다</p>
            </div>
          )}
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
