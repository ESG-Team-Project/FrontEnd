'use client';

import { Button } from '@/components/ui/button';
import InputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { authAtom, login as loginAtom } from '@/lib/atoms/auth';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // jotai atom 사용
  const [auth, setAuth] = useAtom(authAtom);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      // API 호출 예시 (실제 구현에 맞게 수정 필요)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, company }),
      });

      if (!response.ok) {
        throw new Error('회원가입 실패');
      }

      const data = await response.json();
      
      // 회원가입 성공 시 자동 로그인
      loginAtom(setAuth, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        company: data.user.company
      }, data.token);
      
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
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <Button type="submit" className="w-full text-white bg-(--color-primary-foreground)">
          가입하기
        </Button>
      </form>
    </AuthContainer>
  );
}
