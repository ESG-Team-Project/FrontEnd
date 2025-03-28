'use client';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NaviBar() {
  const location = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userName, setUserName] = useState('');

  useEffect(() => {
    // localStorage에서 로그인 상태 확인
    const token = localStorage.getItem('auth_token');
    // const user = localStorage.getItem('user');
    // {/*&& user*/}
    if (token) {
      setIsLoggedIn(true);
      // setUserName(JSON.parse(user).username);
    }
  }, []);

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
            <Link href="/">
              <Button
                variant="ghost"
                className={
                  location === '/mypage/account'
                    ? 'text-black bg-white whitespace-nowrap'
                    : 'text-black hidden bg-white whitespace-nowrap'
                }
              >
                로그아웃
              </Button>
            </Link>
            {isLoggedIn ? (
              <Link href="/mypage/account">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=LDM`} />
                  {/* <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback> */}
                </Avatar>
              </Link>
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
