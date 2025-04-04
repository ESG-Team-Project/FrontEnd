'use client';
import { NavigationMenu } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useAtom } from 'jotai';
import { isLoggedInAtom, logoutAtom } from '@/lib/atoms';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, LogOut } from 'lucide-react';

export default function NaviBar() {
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [, logout] = useAtom(logoutAtom);

  const handleLogout = () => {
    // logoutAtom 액션을 호출하면 내부적으로 상태 초기화 및 localStorage 정리가 이루어질 것으로 기대
    logout();
    // 직접 localStorage를 건드리는 로직은 logoutAtom 구현에 따라 제거하거나 유지
    // if (typeof window !== 'undefined') {
    //   localStorage.removeItem('auth'); // authAtom이 사용하는 키
    // }
  };

  return (
    <NavigationMenu className="fixed top-0 left-0 right-0 z-50 min-w-full bg-white shadow-sm">
      <div className="w-full max-w-screen-xl px-4 mx-auto">
        <div className="flex items-center justify-between w-full h-16">
          <NavigationMenu>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Logo />
              <span className="text-xl font-bold sm:text-2xl">Green Dynamics</span>
            </Link>
          </NavigationMenu>

          <NavigationMenu className="flex items-center gap-2 sm:gap-4">
            {isLoggedIn ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="cursor-pointer p-1 hover:bg-gray-100 rounded-full">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <div className="flex flex-col">
                      <Link
                        href="/mypage/account"
                        className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-gray-100"
                      >
                        <User size={16} />
                        <span>마이페이지</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 text-left text-red-500 transition-colors hover:bg-gray-100"
                        type="button"
                      >
                        <LogOut size={16} />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="text-black bg-white whitespace-nowrap">
                  로그인
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button
                variant="default"
                className="text-xs text-white bg-black sm:text-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">대시보드 시작하기</span>
                <span className="sm:hidden">시작하기</span>
              </Button>
            </Link>
          </NavigationMenu>
        </div>
      </div>
    </NavigationMenu>
  );
}
