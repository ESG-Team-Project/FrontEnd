"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useState, useEffect } from "react";

export default function NaviBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // localStorage에서 로그인 상태 확인
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setUserName(JSON.parse(user).username);
    }
  }, []);

  return (
    <NavigationMenu className="fixed top-0 left-0 right-0 bg-white shadow-sm min-w-full z-50">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="flex w-full justify-between items-center h-16">
          <NavigationMenu>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Logo />
              <span className="text-xl sm:text-2xl font-bold">Green Dynamics</span>
            </Link>
          </NavigationMenu>

          <NavigationMenu className="flex items-center gap-2 sm:gap-4">
            {isLoggedIn ? (
              <Link href="/mypage">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                  <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="bg-white text-black whitespace-nowrap">로그인</Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="default" className="bg-black text-white text-xs sm:text-sm whitespace-nowrap">
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
