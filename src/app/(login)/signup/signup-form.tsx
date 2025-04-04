'use client';

import { Button } from '@/components/ui/button';
import InputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { authAtom } from '@/lib/atoms';
import { loginAtom } from '@/lib/atoms/auth';
import { authService } from '@/lib/api';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // jotai atom 사용
  const [, login] = useAtom(loginAtom);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      // auth.ts의 signup 함수 사용
      const response = await authService.signup({ 
        email, 
        password, 
        name, 
        company 
      });

      // 회원가입 성공 시 자동 로그인
      login({
        user: {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          company: response.user.company,
        },
        token: response.token
      });

      router.push('/dashboard');
    } catch (err) {
      setError('회원가입 처리 중 오류가 발생했습니다');
      console.error(err);
    }
  };

  return (
    <AuthContainer
      title="회원가입"
      footerContent={
        <p className="w-full text-sm text-center">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSignup}>
        <InputBox
          label="이메일"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required={true}
        >
          you@example.com
        </InputBox>

        <InputBox
          label="이름"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required={true}
        >
          홍길동
        </InputBox>

        <InputBox
          label="회사명"
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
        >
          그린다이나믹스
        </InputBox>

        <InputBox
          label="비밀번호"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required={true}
        >
          ********
        </InputBox>

        <InputBox
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required={true}
        >
          ********
        </InputBox>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button type="submit" className="w-full text-white bg-(--color-primary-foreground)">
          가입하기
        </Button>
      </form>
    </AuthContainer>
  );
}
