'use client';

import { Button } from '@/components/ui/button';
import InputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { useAtom } from 'jotai';
import { authAtom, isLoggedInAtom } from '@/lib/atoms/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 리다이렉트할 경로 가져오기 (URL에서 ?redirectTo=경로)
  const redirectPath = searchParams.get('redirectTo') || '/dashboard';
  
  // jotai atom 사용
  const [auth, setAuth] = useAtom(authAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  
  // 로그인 상태에 따른 리다이렉션
  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectPath);
    }
  }, [isLoggedIn, redirectPath, router]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // 수정된 login 함수에 setAuth 전달
      const response = await login({ email, password }, setAuth);
      console.log('로그인 성공:', response);
      
      // 로그인 성공시 리다이렉션은 useEffect에서 처리
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || 
        '로그인 실패. 이메일과 비밀번호를 확인해주세요.'
      );
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
        
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        <Button 
          type="submit" 
          className="w-full text-white bg-(--color-primary-foreground)"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </AuthContainer>
  );
}
