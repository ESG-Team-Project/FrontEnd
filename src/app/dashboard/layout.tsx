import DashboardSidebar from '@/components/dashboard-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import ProtectedRoute from '@/components/protected-route';

export const metadata: Metadata = {
  title: 'ESG 대시보드',
  description: 'ESG 성과 관리 대시보드',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex w-full h-full">
        <SidebarProvider className="h-full">
          <DashboardSidebar />
        </SidebarProvider>
        <section className="w-full">{children}</section>
      </div>
    </ProtectedRoute>
  );
}
