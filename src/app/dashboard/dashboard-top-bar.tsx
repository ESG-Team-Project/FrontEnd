'use client';

import { ReactNode } from 'react';
import { CustomButton } from '@/components/ui/custom-button';
import { useAtom } from 'jotai';
import { layoutLockedAtom, sidebarOpenAtom } from '@/lib/atoms';
import { PanelLeftClose, PanelRightClose, Menu, ChevronRight, Home } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardTopBarProps {
  // 우측 메뉴 아이템을 개별 페이지에서 전달받음 (선택적)
  rightMenuItems?: ReactNode;
  // 페이지 제목 (선택적)
  pageTitle?: string;
}

// 경로 세그먼트를 기반으로 breadcrumb 항목을 생성하는 함수
const generateBreadcrumbs = (pathname: string): Array<{ label: string; href: string }> => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: '대시보드', href: '/dashboard' }];
  
  // 대시보드 이후의 경로 세그먼트에 대한 breadcrumbs 생성
  let currentPath = '/dashboard';
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // 경로 세그먼트에 따른 레이블 매핑
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // 특정 경로에 대한 사용자 정의 레이블
    if (segment === 'gri') label = '데이터 편집';
    else if (segment === 'charts') label = '차트';
    else if (segment === 'reports') label = '보고서';
    else if (segment === 'settings') label = '설정';
    
    breadcrumbs.push({ label, href: currentPath });
  }
  
  return breadcrumbs;
};

export default function DashboardTopBar({ rightMenuItems, pageTitle }: DashboardTopBarProps) {
  const [isLayoutLocked, setLayoutLocked] = useAtom(layoutLockedAtom);
  const [, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const pathname = usePathname();
  
  const breadcrumbs = generateBreadcrumbs(pathname);

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
    <div className={clsx(
      "fixed top-16 right-0 z-20",
      "flex flex-row justify-between items-center px-4 py-3 border-b bg-gray-50",
      "transition-all duration-300 ease-in-out",
      isLayoutLocked 
        ? "md:left-16 md:w-[calc(100%-theme(space.16))] left-0 w-full"
        : "md:left-60 md:w-[calc(100%-theme(space.60))] left-0 w-full"
    )}>
      <div className="flex items-center">
        <CustomButton 
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
        </CustomButton>
        
        <CustomButton 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="mr-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </CustomButton>

        {/* Breadcrumbs */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="inline-flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                  )}
                  {isLast ? (
                    <span className="text-gray-600 font-medium text-sm md:text-base">
                      {pageTitle || crumb.label}
                    </span>
                  ) : (
                    <Link 
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-700 text-sm md:text-base"
                    >
                      {index === 0 ? (
                        <span className="flex items-center">
                          <Home className="w-4 h-4 inline mr-1" />
                          <span className="hidden md:inline">{crumb.label}</span>
                        </span>
                      ) : (
                        crumb.label
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        {rightMenuItems}
      </div>
    </div>
  );
} 