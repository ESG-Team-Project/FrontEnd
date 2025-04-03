'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DashboardClientLayoutProps {
  children: ReactNode;
}

export default function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
  const pathname = usePathname();

  // 페이지 경로 변경 시 스크롤 위치를 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex w-full h-full">
      <SidebarProvider className="h-full">
        <DashboardSidebar />
      </SidebarProvider>
      <section className="w-full">{children}</section>
    </div>
  );
} 