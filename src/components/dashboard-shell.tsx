import type { ReactNode } from 'react';
import NaviBar from './NaviBar';
import DashboardTopBar from '@/app/dashboard/dashboard-top-bar';

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NaviBar />
      <DashboardTopBar />
      <main className="flex-1 pt-16 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        <div className="ml-0 md:ml-[240px] mt-16 md:mt-16 w-full md:w-[calc(100%-240px)]">
          {children}
        </div>
      </main>
    </div>
  );
} 