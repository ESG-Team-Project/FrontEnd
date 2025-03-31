'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LabeledInputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { signup } from '../../../lib/api/signup';
import { useRouter } from 'next/navigation';

export function SignUpForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const next = () => setStep(prev => prev + 1);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signup({
        email,
        password,
        checkPassword,
        companyName,
        ceoName,
        companyCode,
        companyPhoneNumber,
        name,
        phoneNumber,
      });
      console.log(response);
      router.push('/login');
    } catch (err) {
      setError('회원가입 실패');
      router.push('/signup');
      console.log(email, password);
      console.log(err);
    }
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
            <LabeledInputBox
              value={email}
              onChange={e => setEmail(e.target.value)}
              label="이메일"
              type="email"
            >
              you@example.com
            </LabeledInputBox>
            <LabeledInputBox
              value={password}
              onChange={e => setPassword(e.target.value)}
              label="비밀번호"
              type="password"
            />
            <LabeledInputBox
              value={checkPassword}
              onChange={e => setCheckPassword(e.target.value)}
              label="비밀번호 확인"
              type="password"
            />
          </>
        )}

        {step === 2 && (
          <>
            <LabeledInputBox
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              label="회사명"
              type="string"
            />
            <LabeledInputBox
              value={ceoName}
              onChange={e => setCeoName(e.target.value)}
              label="대표자명"
              type="string"
            />
            <LabeledInputBox
              value={companyCode}
              onChange={e => setCompanyCode(e.target.value)}
              label="사업자 등록번호"
              type="string"
            />
            <LabeledInputBox
              value={companyPhoneNumber}
              onChange={e => setCompanyPhoneNumber(e.target.value)}
              label="대표번호"
              type="string"
            />
            <LabeledInputBox
              value={name}
              onChange={e => setName(e.target.value)}
              label="담당자명"
              type="string"
            />
            <LabeledInputBox
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              label="전화번호"
              type="string"
            />
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
