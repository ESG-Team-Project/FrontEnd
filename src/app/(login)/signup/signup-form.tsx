'use client';

import { Button } from '@/components/ui/button';
import InputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { loginAtom } from '@/lib/atoms/auth';
import { signup } from '@/lib/api/signup';

export function SignupForm() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    ceoName: '',
    companyCode: '',
    companyPhoneNumber: '',
    phoneNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // jotai atom 사용
  const [, login] = useAtom(loginAtom);

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (userInfo.password !== userInfo.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    // 다음 단계로 이동
    setStep(2);
  };

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // API 호출
      const response = await signup({
        email: userInfo.email,
        password: userInfo.password,
        checkPassword: userInfo.confirmPassword,
        name: userInfo.name,
        companyName: companyInfo.companyName,
        ceoName: companyInfo.ceoName,
        companyCode: companyInfo.companyCode,
        companyPhoneNumber: companyInfo.companyPhoneNumber,
        phoneNumber: companyInfo.phoneNumber
      });

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/login');
    } catch (err) {
      setError('회원가입 처리 중 오류가 발생했습니다');
      console.error(err);
    }
  };

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AuthContainer
      title={`회원가입 (${step}/2)`}
      footerContent={
        <p className="w-full text-sm text-center">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      }
    >
      {step === 1 ? (
        <form className="space-y-4" onSubmit={handleUserInfoSubmit}>
          <InputBox
            label="이메일"
            name="email"
            type="email"
            value={userInfo.email}
            onChange={handleUserInfoChange}
            required={true}
          >
            you@example.com
          </InputBox>

          <InputBox
            label="이름"
            name="name"
            type="text"
            value={userInfo.name}
            onChange={handleUserInfoChange}
            required={true}
          >
            홍길동
          </InputBox>

          <InputBox
            label="비밀번호"
            name="password"
            type="password"
            value={userInfo.password}
            onChange={handleUserInfoChange}
            required={true}
          >
            ********
          </InputBox>

          <InputBox
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            value={userInfo.confirmPassword}
            onChange={handleUserInfoChange}
            required={true}
          >
            ********
          </InputBox>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" className="w-full ">
            다음
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleCompanyInfoSubmit}>
          <InputBox
            label="회사명"
            name="companyName"
            type="text"
            value={companyInfo.companyName}
            onChange={handleCompanyInfoChange}
            required={true}
          >
            그린다이나믹스
          </InputBox>

          <InputBox
            label="대표자명"
            name="ceoName"
            type="text"
            value={companyInfo.ceoName}
            onChange={handleCompanyInfoChange}
            required={true}
          >
            홍길동
          </InputBox>

          <InputBox
            label="사업자번호"
            name="companyCode"
            type="text"
            value={companyInfo.companyCode}
            onChange={handleCompanyInfoChange}
            required={true}
          >
            123-45-67890
          </InputBox>

          <InputBox
            label="회사전화번호"
            name="companyPhoneNumber"
            type="tel"
            value={companyInfo.companyPhoneNumber}
            onChange={handleCompanyInfoChange}
            required={true}
          >
            02-1234-5678
          </InputBox>

          <InputBox
            label="담당자 전화번호"
            name="phoneNumber"
            type="tel"
            value={companyInfo.phoneNumber}
            onChange={handleCompanyInfoChange}
            required={true}
          >
            010-1234-5678
          </InputBox>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              이전
            </Button>
            <Button type="submit" className="flex-1">
              가입하기
            </Button>
          </div>
        </form>
      )}
    </AuthContainer>
  );
}
