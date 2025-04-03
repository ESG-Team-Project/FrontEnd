import type { Metadata } from 'next';
import ProtectedRoute from '@/components/protected-route';
import DashboardDataProvider from '@/contexts/dashboard-context';
import DashboardClientLayout from '@/components/dashboard/client-layout';

export const metadata: Metadata = {
  title: 'ESG 대시보드',
  description: 'ESG 성과 관리 대시보드',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardDataProvider>
        <DashboardClientLayout>{children}</DashboardClientLayout>
      </DashboardDataProvider>
    </ProtectedRoute>
  );
}
