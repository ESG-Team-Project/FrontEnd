'use client';
import { AppSidebar } from '@/components/mypageSidebar';
import { Building, User } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ProtectedRoute from '@/components/protected-route';

export default function Layout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { title: '담당자 정보', url: '/mypage/account', icon: User },
    { title: '회사 정보', url: '/mypage/company', icon: Building },
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-row w-screen">
        <SidebarProvider className="w-fit">
          <AppSidebar items={menuItems} />
        </SidebarProvider>
        <div className="justify-center w-screen">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
