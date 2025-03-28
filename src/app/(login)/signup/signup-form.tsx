'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LabeledInputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';

export function SignUpForm() {
  const [step, setStep] = useState(1);

  const next = () => setStep(prev => prev + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('회원가입 완료');
  };

  return (
    <AuthContainer
      title="Sign Up"
      footerContent={
        <p className="w-full text-sm text-center">
          이미 계정을 가지고 계신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <LabeledInputBox label="이메일" type="email">
              you@example.com
            </LabeledInputBox>
            <LabeledInputBox label="비밀번호" type="password" />
            <LabeledInputBox label="비밀번호 확인" type="password" />
          </>
        )}

        {step === 2 && (
          <>
            <LabeledInputBox label="회사명" type="string" />
            <LabeledInputBox label="대표자명" type="string" />
            <LabeledInputBox label="사업자 등록번호" type="string" />
            <LabeledInputBox label="대표번호" type="string" />
            <LabeledInputBox label="담당자명" type="string" />
            <LabeledInputBox label="전화번호" type="string" />
          </>
        )}

        <div className="flex gap-2">
          {step === 1 && (
            <Button
              type="button"
              className="w-full text-white bg-emerald-600 hover:bg-emerald-700"
              onClick={next}
            >
              다음
            </Button>
          )}
          {step === 2 && (
            <Button type="submit" className="w-full text-white bg-emerald-600 hover:bg-emerald-700">
              회원가입
            </Button>
          )}
        </div>
      </form>
    </AuthContainer>
  );
}
