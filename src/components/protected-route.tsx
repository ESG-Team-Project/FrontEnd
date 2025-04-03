'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import React, { type ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { isLoggedInAtom, authInitializedAtom } from '@/lib/atoms/auth';

// --- Simple Error Boundary Component --- 
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
class MyErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-screen bg-red-100 text-red-700 p-4">
          <div>
            <h1 className="text-xl font-bold mb-2">오류 발생</h1>
            <p>이 섹션을 표시하는 중 오류가 발생했습니다.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 text-xs whitespace-pre-wrap bg-red-50 p-2 rounded">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// --- End of Error Boundary --- 

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

// 로딩 컴포넌트 (재사용)
const LoadingIndicator = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">인증 상태 확인 중...</p> {/* 문구 변경 */}
    </div>
  </div>
);

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [isInitialized] = useAtom(authInitializedAtom);

  // 환경 변수 및 쿼리 파라미터 기반 우회 로직
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  const queryBypass = process.env.NODE_ENV !== 'production' && searchParams.get('bypass_auth') === 'true';
  const shouldBypass = bypassAuth || queryBypass;

  // 현재 경로가 마이페이지인지 확인
  const isMyPage = pathname.startsWith('/mypage');

  // 디버깅 로그: 컴포넌트가 렌더링될 때마다 상태 확인
  console.log(`ProtectedRoute Render Check on ${pathname}: isMyPage=${isMyPage}, shouldBypass=${shouldBypass}, isInitialized=${isInitialized}, isLoggedIn=${isLoggedIn}`);

  // 리다이렉션 로직: 초기화 완료 후 상태 기반으로 실행
  useEffect(() => {
    console.log(`ProtectedRoute Effect Check on ${pathname}: isInitialized=${isInitialized}, isLoggedIn=${isLoggedIn}, shouldRedirect=${!isMyPage && !shouldBypass && isInitialized && !isLoggedIn}`);
    // 상태가 안정화되기 전(초기화 미완료), 마이페이지거나, 우회 설정이면 실행 안 함
    if (!isInitialized || isMyPage || shouldBypass) {
      return;
    }

    // 초기화 완료 후, 로그인 안 됐으면 리다이렉트
    if (!isLoggedIn) {
      console.log(`ProtectedRoute: Redirecting from ${pathname} to login.`);
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?redirectTo=${returnUrl}`);
    }
  }, [isLoggedIn, isInitialized, shouldBypass, isMyPage, pathname, router, redirectTo]);

  // --- 렌더링 로직 --- 

  // 1. 마이페이지거나 우회 설정이면 즉시 children 렌더링
  if (isMyPage || shouldBypass) {
    console.log(`ProtectedRoute Render on ${pathname}: Rendering children (MyPage or Bypass).`);
    return <MyErrorBoundary>{children}</MyErrorBoundary>;
  }

  // 2. 마이페이지가 아니면서, 아직 전역 초기화 안 됐으면 로딩 화면 표시
  //    이 조건이 뒤로가기 시 캐시된 내용 대신 로딩을 보여주는 핵심 역할
  if (!isInitialized) {
    console.log(`ProtectedRoute Render on ${pathname}: Showing Loading Indicator (Not Initialized).`);
    return <LoadingIndicator />;
  }

  // 3. 마이페이지가 아니고, 초기화 완료됐고, 로그인 상태이면 children 렌더링
  if (isInitialized && isLoggedIn) {
    console.log(`ProtectedRoute Render on ${pathname}: Rendering children (Initialized and Logged In).`);
    return <MyErrorBoundary>{children}</MyErrorBoundary>;
  }

  // 4. 마이페이지 아니고, 초기화 완료됐고, 로그인 상태 아니면 null (리다이렉션 대기)
  console.log(`ProtectedRoute Render on ${pathname}: Rendering null (Initialized but Not Logged In - waiting for redirect effect).`);
  return null;
} 