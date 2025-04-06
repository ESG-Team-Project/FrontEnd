'use client';

import InputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/api';
import { isLoggedInAtom, loginAtom } from '@/lib/atoms';
import type { User } from '@/lib/atoms';
import type { LoginResponse } from '@/types/auth';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthContainer from '../AuthContainer';
import type { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirectTo') || '/dashboard';

  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [, login] = useAtom(loginAtom);

  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectPath);
    }
  }, [isLoggedIn, redirectPath, router]);

  // LoginResponse 타입인지 확인하는 타입 가드 함수
  const isLoginResponse = (data: any): data is LoginResponse => {
    return (
      data !== null &&
      typeof data === 'object' &&
      typeof data.success === 'boolean' &&
      typeof data.token === 'string' &&
      data.user !== undefined &&
      typeof data.user === 'object' &&
      typeof data.user.id === 'number' &&
      typeof data.user.name === 'string' &&
      typeof data.user.email === 'string' &&
      typeof data.user.companyName === 'string'
    );
  };

  // API 응답에서 User 객체로 변환하는 함수
  const mapApiResponseToUser = (apiResponse: LoginResponse): User => {
    return {
      id: String(apiResponse.user.id),
      name: apiResponse.user.name,
      email: apiResponse.user.email,
      role: 'user',
      phone: apiResponse.user.phoneNumber,
      company: apiResponse.user.companyName,
    };
  };

  // 로그인 처리 함수
  const handleLogin = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // 백엔드에서 기대하는 정확한 형식으로 데이터 구성
      const loginData = {
        email: data.email,
        password: data.password
      };
      
      console.log('로그인 시도:', loginData);
      
      // 로그인 API 호출
      const response = await authService.login(loginData);
      
      if (!response || !response.token) {
        throw new Error('로그인 실패: 응답에 토큰이 없습니다.');
      }
      
      console.log('로그인 성공:', `${response.token.substring(0, 10)}...`);
      
      // 상태 관리에 로그인 정보 저장
      login({ token: response.token, user: response.user });
      
      // 성공 메시지와 리디렉션
      toast({
        title: '로그인 성공',
        description: '대시보드로 이동합니다.',
      });
      
      // 리디렉션 처리
      if (redirectPath) {
        router.push(decodeURIComponent(redirectPath));
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      
      // 403 오류 특별 처리
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast({
          variant: 'destructive',
          title: '접근 권한 오류',
          description: '계정에 로그인 권한이 없습니다. 관리자에게 문의하세요.',
        });
        return;
      }
      
      // 일반 오류 처리
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: error instanceof Error 
          ? error.message 
          : '로그인 처리 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Login"
      footerContent={
        <p className="w-full text-sm text-center">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        <InputBox
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        >
          you@example.com
        </InputBox>
        <InputBox
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        >
          ********
        </InputBox>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <Button
          type="submit"
          className="w-full text-white bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </AuthContainer>
  );
}
