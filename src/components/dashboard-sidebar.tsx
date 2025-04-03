'use client';

import React, { useState, useEffect } from 'react';
import { CustomButton } from '@/components/ui/custom-button';
import {
  User,
  Building,
  Loader2,
  Menu,
  LayoutDashboard,
  BarChart3,
  LineChart,
  PieChart,
  FileText,
  Settings,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { UserInfo } from '@/types/user';
import { useAtom } from 'jotai';
import { layoutLockedAtom, sidebarOpenAtom } from '@/lib/atoms';
import clsx from 'clsx';
// 선택적으로 차트 선택기 임포트 (지금은 사용하지 않음)
// import ChartSelector from './chart-selector';

// 네비게이션 아이템 정의
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isLayoutLocked] = useAtom(layoutLockedAtom);
  const [isMobileOpen] = useAtom(sidebarOpenAtom);

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

  // 네비게이션 아이템 목록
  const navItems: NavItem[] = [
    {
      label: '대시보드',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      label: '데이터 편집',
      href: '/dashboard/gri',
      icon: <Database className="w-5 h-5" />
    },
    {
      label: '보고서',
      href: '/dashboard/reports',
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: '설정',
      href: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  // 현재 페이지가 네비게이션 아이템 또는 하위 항목과 일치하는지 확인
  const isActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  // 상위 네비게이션 렌더링
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item);
    return (
      <li key={item.href} className="mb-1">
        <Link
          href={item.href}
          className={clsx(
            "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
            active 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            isLayoutLocked && "justify-center px-2"
          )}
        >
          <span className={clsx(isLayoutLocked ? "mr-0" : "mr-3")}>{item.icon}</span>
          {!isLayoutLocked && <span>{item.label}</span>}
        </Link>
        
        {!isLayoutLocked && item.children && (
          <ul className="pl-8 mt-1 space-y-1">
            {item.children.map(child => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={clsx(
                    "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                    pathname === child.href 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <span className="mr-2">{child.icon}</span>
                  <span>{child.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
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
        "flex items-center pb-2 border-b p-2 mb-4",
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

      {/* 네비게이션 메뉴 */}
      <nav>
        <ul className="space-y-1">
          {navItems.map(renderNavItem)}
        </ul>
      </nav>

      {/* ChartSelector 컴포넌트는 보존하지만 지금은 사용하지 않음 */}
      {/* <ChartSelector isLayoutLocked={isLayoutLocked} /> */}
    </aside>
  );
}
