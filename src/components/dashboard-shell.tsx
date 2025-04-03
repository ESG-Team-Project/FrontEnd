'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import NaviBar from './NaviBar';
import DashboardTopBar from '@/app/dashboard/dashboard-top-bar';
import { useAtom } from 'jotai';
import { layoutLockedAtom } from '@/lib/atoms';
import clsx from 'clsx';
import { useDashboard } from '@/contexts/dashboard-context';
import { LoadingState } from './dashboard/loading-state';
import { ErrorState } from './dashboard/error-state';
import { AuthRequired } from './dashboard/auth-required';
import { usePathname } from 'next/navigation';

interface DashboardShellProps {
  children: ReactNode;
  // 페이지 제목
  pageTitle?: string;
  // 상단 바 우측 메뉴 아이템
  rightMenuItems?: ReactNode;
  // 로딩 메시지 (기본값 사용하지 않으려면 직접 지정)
  loadingMessage?: string;
  // 에러 메시지 오버라이드
  errorMessage?: string;
  // 인증 필요 메시지 오버라이드
  authRequiredMessage?: string;
  // 로딩/에러 상태를 수동으로 관리할지 여부
  manualStateHandling?: boolean;
  // 수동 상태 관리 시 사용할 상태들
  isLoading?: boolean;
  error?: string | null;
  // 에러 발생 시 재시도 함수
  onRetry?: () => void;
}

export default function DashboardShell({
  children,
  pageTitle = '대시보드',
  rightMenuItems,
  loadingMessage,
  errorMessage,
  authRequiredMessage,
  manualStateHandling = false,
  isLoading: manualLoading,
  error: manualError,
  onRetry,
}: DashboardShellProps) {
  const [isLayoutLocked] = useAtom(layoutLockedAtom);
  const { loading: contextLoading, error: contextError, companyId, refreshData } = useDashboard();
  const pathname = usePathname();

  // 로딩 및 에러 상태 결정 (수동 또는 컨텍스트에서)
  const isLoading = manualStateHandling ? manualLoading : contextLoading;
  const error = manualStateHandling ? manualError : contextError;
  const retryHandler = onRetry || refreshData;

  // 페이지 경로 변경 시 스크롤 위치를 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 컨텐츠 렌더링
  const renderContent = () => {
    // 로딩 중일 때
    if (isLoading) {
      return <LoadingState message={loadingMessage} />;
    }

    // 에러가 있을 때
    if (error) {
      return <ErrorState message={errorMessage || error} onRetry={retryHandler} />;
    }

    // 인증이 안되었을 때 (companyId가 없음)
    if (!manualStateHandling && !companyId) {
      return <AuthRequired message={authRequiredMessage} />;
    }

    // 정상 컨텐츠 표시
    return children;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NaviBar />
      <DashboardTopBar pageTitle={pageTitle} rightMenuItems={rightMenuItems} />
      <main className="flex-1 pt-16 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        <div
          className={clsx(
            'my-8 md:my-8 w-full transition-all duration-300 ease-in-out',
            isLayoutLocked
              ? 'md:ml-16 md:w-[calc(100%-theme(space.16))]'
              : 'md:ml-60 md:w-[calc(100%-theme(space.60))]'
          )}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
