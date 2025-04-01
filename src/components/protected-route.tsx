'use client';

import { useAtom } from 'jotai';
import { isLoggedInAtom } from '@/lib/atoms/auth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * 로그인 상태를 확인하는 컴포넌트
 * 로그인되지 않은 사용자는 redirectTo 경로로 리다이렉트됩니다
 * 현재 접근하려던 경로를 쿼리 파라미터로 전달합니다
 * 
 * 환경 변수로 보호 기능을 우회할 수 있습니다:
 * - NEXT_PUBLIC_BYPASS_AUTH=true: 인증 보호 우회 (개발/테스트용)
 * - NEXT_PUBLIC_BYPASS_AUTH=false 또는 미설정: 인증 보호 활성화 (기본값)
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 환경 변수로 보호 기능 토글 (기본값: false - 보호 활성화)
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  
  // 쿼리 파라미터로 우회 여부 확인 (개발환경에서만 동작)
  const queryBypass = process.env.NODE_ENV !== 'production' && 
                      searchParams.get('bypass_auth') === 'true';
  
  // 최종 우회 여부
  const shouldBypass = bypassAuth || queryBypass;

  useEffect(() => {
    // 로그인되지 않았고, 우회하지 않을 경우에만 리다이렉트
    if (!isLoggedIn && !shouldBypass) {
      // 현재 접근하려던 경로를 쿼리 파라미터로 전달
      const returnUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?redirectTo=${returnUrl}`);
    }
  }, [isLoggedIn, redirectTo, router, pathname, shouldBypass]);

  // 로그인되었거나 우회 설정이 활성화된 경우 자식 컴포넌트 렌더링
  if (isLoggedIn || shouldBypass) {
    return <>{children}</>;
  }

  // 로그인 상태 확인 중에는 로딩 화면 표시
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">로그인 상태를 확인하는 중...</p>
        {process.env.NODE_ENV !== 'production' && (
          <p className="text-xs text-gray-400 mt-2">
            테스트를 위해 URL에 ?bypass_auth=true를 추가하여 인증을 우회할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
} 