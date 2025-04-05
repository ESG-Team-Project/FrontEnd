'use client';

import { Button } from '@/components/ui/button';
import InputBox from '@/components/labeled-inputbox';
import Link from 'next/link';
import AuthContainer from '../AuthContainer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { loginAtom } from '@/lib/atoms';
import { authService } from '@/lib/api';
import type { SignUpRequest, SignUpResponse } from '@/types/auth';

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

  // SignUpResponse 타입인지 확인하는 타입 가드 함수
  const isSignUpResponse = (data: unknown): data is SignUpResponse => {
    if (data === null || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj.id === 'number' &&
      typeof obj.email === 'string' &&
      typeof obj.name === 'string'
    );
  };

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
      const signupData: SignUpRequest = {
        email: userInfo.email,
        password: userInfo.password,
        checkPassword: userInfo.confirmPassword,
        name: userInfo.name,
        companyName: companyInfo.companyName,
        ceoName: companyInfo.ceoName,
        companyCode: companyInfo.companyCode,
        companyPhoneNumber: companyInfo.companyPhoneNumber,
        phoneNumber: companyInfo.phoneNumber
      };
      
      const response = await authService.signup(signupData);
      
      // 응답 확인
      console.log('회원가입 응답:', response);
      
      // 타입 가드를 통한 안전한 타입 처리
      if (isSignUpResponse(response)) {
        // 회원가입 성공 시 자동 로그인
        login({
          user: {
            id: String(response.id),
            name: response.name,
            email: response.email,
            role: 'user',
            company: response.companyName || '',
          },
          token: response.token || ''
        });

        router.push('/dashboard');
      } else {
        console.error(`예상과 다른 회원가입 응답 형식: ${JSON.stringify(response)}`);
        throw new Error(`예상과 다른 회원가입 응답 형식: ${JSON.stringify(response)}`);
      }
    } catch (error: unknown) {
      // 오류 응답 처리
      const err = error as { response?: { status: number; data?: { errors?: Record<string, string>; message?: string } } };
      if (err.response) {
        // 409 오류: 이미 존재하는 이메일
        if (err.response.status === 409) {
          setError('이미 사용 중인 이메일입니다');
        } 
        // 400 오류: 유효성 검증 실패
        else if (err.response.status === 400 && err.response.data?.errors) {
          const validationErrors = Object.values(err.response.data.errors).join(', ');
          setError(`입력값 유효성 검증에 실패했습니다: ${validationErrors}`);
        } 
        // 그 외 서버 오류
        else {
          setError(err.response.data?.message || '회원가입 처리 중 오류가 발생했습니다');
        }
      } else {
        setError((error as Error).message || '회원가입 처리 중 오류가 발생했습니다');
      }
      console.error(error);
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
