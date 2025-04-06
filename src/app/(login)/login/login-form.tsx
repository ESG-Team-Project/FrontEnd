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

  // 초기 마운트 시 로그인 상태 확인
  useEffect(() => {
    console.log('[Login Form] 초기 마운트 - 로그인 상태 확인:', isLoggedIn);
    
    // 이미 로그인되어 있으면 대시보드로 이동
    if (isLoggedIn) {
      console.log('[Login Form] 이미 로그인되어 있음, 리디렉션 시도');
      router.push(redirectPath);
    }
  }, []);

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
      role: apiResponse.user.role || 'user',
      company: apiResponse.user.companyName,
      phoneNumber: apiResponse.user.phoneNumber,
      companyName: apiResponse.user.companyName,
      ceoName: apiResponse.user.ceoName,
      companyCode: apiResponse.user.companyCode,
      companyPhoneNumber: apiResponse.user.companyPhoneNumber
    };
  };

  // 로그인 처리 함수
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 로컬 스토리지의 기존 로그인 정보를 제거 (충돌 방지)
      if (typeof window !== 'undefined') {
        console.log('[Login Form] 기존 로그인 정보 정리');
        localStorage.removeItem('auth');
        localStorage.removeItem('auth_token');
      }
      
      // 백엔드에서 기대하는 정확한 형식으로 데이터 구성
      const loginData = {
        email,
        password
      };
      
      console.log('[Login Form] 로그인 시도:', { email });
      
      // 로그인 API 호출
      const response = await authService.login(loginData);
      
      console.log('[Login Form] 로그인 응답:', response);
      
      if (!response || !response.token) {
        throw new Error('로그인 실패: 응답에 토큰이 없습니다.');
      }
      
      console.log('[Login Form] 로그인 성공:', `토큰: ${response.token.substring(0, 10)}...`);
      console.log('[Login Form] 사용자 정보:', response.user);
      
      // User 인터페이스와 호환되는 객체로 변환
      const userForState = mapApiResponseToUser(response);
      console.log('[Login Form] 변환된 사용자 정보:', userForState);
      
      // 로컬 스토리지에 토큰 직접 저장 (추가 안전 장치)
      if (typeof window !== 'undefined') {
        console.log('[Login Form] 로컬 스토리지에 인증 정보 저장');
        localStorage.setItem('auth', JSON.stringify({
          token: response.token,
          user: userForState,
          isLoggedIn: true,
          isLoading: false
        }));
        
        // auth_token 키에도 저장 (일부 API 호출에 사용)
        localStorage.setItem('auth_token', response.token);
      }
      
      // 상태 관리에 로그인 정보 저장 (변환된 사용자 정보 사용)
      login({ token: response.token, user: userForState });
      
      // 성공 메시지
      toast({
        title: '로그인 성공',
        description: '대시보드로 이동합니다.',
      });
      
      console.log('[Login Form] 리디렉션 경로:', redirectPath);
      
      // 리디렉션 처리 - 시간 지연 추가
      setTimeout(() => {
        if (redirectPath) {
          console.log('[Login Form] 리디렉션:', decodeURIComponent(redirectPath));
          router.push(decodeURIComponent(redirectPath));
        } else {
          console.log('[Login Form] 리디렉션: /dashboard');
          router.push('/dashboard');
        }
      }, 1000); // 1초 지연으로 상태 업데이트 시간 제공
      
    } catch (error) {
      console.error('[Login Form] 로그인 오류:', error);
      
      // 403 오류 특별 처리
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast({
          variant: 'destructive',
          title: '접근 권한 오류',
          description: '계정에 로그인 권한이 없습니다. 관리자에게 문의하세요.',
        });
        setError('계정에 로그인 권한이 없습니다. 관리자에게 문의하세요.');
        return;
      }
      
      // 일반 오류 처리
      const errorMessage = error instanceof Error 
        ? error.message 
        : '로그인 처리 중 오류가 발생했습니다.';
      
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: errorMessage,
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 상태가 바뀌면 리디렉션 (별도 useEffect로 분리)
  useEffect(() => {
    console.log('[Login Form] 로그인 상태 변경 감지:', isLoggedIn);
    
    if (isLoggedIn) {
      console.log('[Login Form] 로그인 상태로 변경되어 리디렉션');
      if (redirectPath) {
        router.push(decodeURIComponent(redirectPath));
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoggedIn, redirectPath, router]);

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
