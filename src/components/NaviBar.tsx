'use client';
import { Button } from '@/components/ui/button';
import { NavigationMenu } from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { isLoggedInAtom, logoutAtom, userAtom } from '@/lib/atoms';
import { useAtom } from 'jotai';
import { Building, LogOut, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function NaviBar() {
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [, logout] = useAtom(logoutAtom);
  const [currentUser] = useAtom(userAtom);
  const pathname = usePathname();
  const isMainPage = pathname === '/';

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
                  <PopoverContent className="w-60 p-0">
                    <div className="flex flex-col">
                      {/* 사용자 정보 섹션 */}
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{currentUser?.name || '사용자'}</h3>
                            <p className="text-xs text-gray-500">{currentUser?.email || '이메일 정보 없음'}</p>
                          </div>
                        </div>
                        {currentUser?.company && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <Building className="w-3 h-3" />
                            <span>{currentUser.company}</span>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      {/* 메뉴 섹션 */}
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
                <span className="hidden sm:inline">
                  {isMainPage ? '대시보드 시작하기' : '대시보드'}
                </span>
                <span className="sm:hidden">{isMainPage ? '시작하기' : '대시보드'}</span>
              </Button>
            </Link>
          </NavigationMenu>
        </div>
      </div>
    </NavigationMenu>
  );
}
