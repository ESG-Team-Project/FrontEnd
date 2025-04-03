import type { ReactNode } from 'react';
import NaviBar from './NaviBar';
import DashboardTopBar from '@/app/dashboard/dashboard-top-bar';
import { useAtom } from 'jotai';
import { layoutLockedAtom } from '@/lib/atoms';
import clsx from 'clsx';

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isLayoutLocked] = useAtom(layoutLockedAtom);

  return (
    <div className="flex min-h-screen flex-col">
      <NaviBar />
      <DashboardTopBar />
      <main className="flex-1 pt-16 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        <div className={clsx(
          "mt-16 md:mt-16 w-full transition-all duration-300 ease-in-out",
          isLayoutLocked 
            ? "md:ml-16 md:w-[calc(100%-theme(space.16))]"
            : "md:ml-60 md:w-[calc(100%-theme(space.60))]"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
} 