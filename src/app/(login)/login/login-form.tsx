'use client';

import { Button } from '@/components/ui/button';
import InputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api';
import type { LoginResponse } from '@/types/auth';
import { useAtom } from 'jotai';
import { isLoggedInAtom, loginAtom } from '@/lib/atoms';
import type { User } from '@/lib/atoms';

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
      company: apiResponse.user.companyName
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // API 호출 결과
      const response = await authService.login({ email, password });
      console.log('로그인 API 응답:', response);
      
      // 타입 검사를 통한 안전한 타입 처리
      if (isLoginResponse(response)) {
        if (response.success && response.token && response.user) {
          const userData = mapApiResponseToUser(response);
          login({ user: userData, token: response.token });
          router.push(redirectPath);
        } else {
          throw new Error(response.message || '로그인 응답 형식이 올바르지 않습니다.');
        }
      } else {
        console.error('예상과 다른 응답 형식:', response);
        throw new Error('서버에서 예상하지 않은 응답 형식이 반환되었습니다.');
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('이메일 또는 비밀번호가 일치하지 않습니다.');
        } else if (err.response.status === 400 && err.response.data?.errors) {
          const validationErrors = Object.values(err.response.data.errors).join(', ');
          setError(`입력값 유효성 검증에 실패했습니다: ${validationErrors}`);
        } else {
          setError(err.response.data?.message || '로그인 중 오류가 발생했습니다.');
        }
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.error('로그인 오류:', err);
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
          onChange={e => setEmail(e.target.value)}
        >
          you@example.com
        </InputBox>
        <InputBox
          label="비밀번호"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
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
