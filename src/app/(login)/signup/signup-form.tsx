'use client';

import InputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/api';
import { loginAtom } from '@/lib/atoms';
import type { SignUpRequest, SignUpResponse } from '@/types/auth';
import { ErrorResponse, ValidationError } from '@/types/api';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthContainer from '../AuthContainer';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/toaster';

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
      typeof obj.id === 'number' && typeof obj.email === 'string' && typeof obj.name === 'string'
    );
  };

  // 비밀번호 유효성 검증 함수 추가
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8 || password.length > 20) {
      return {
        isValid: false,
        message: '비밀번호는 8자 이상 20자 이하여야 합니다.'
      };
    }
    
    // 영문자 포함 확인
    if (!/[a-zA-Z]/.test(password)) {
      return {
        isValid: false,
        message: '비밀번호는 최소 하나의 영문자를 포함해야 합니다.'
      };
    }
    
    // 숫자 포함 확인
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: '비밀번호는 최소 하나의 숫자를 포함해야 합니다.'
      };
    }
    
    // 특수문자 포함 확인
    if (!/[@$!%*#?&]/.test(password)) {
      return {
        isValid: false,
        message: '비밀번호는 최소 하나의 특수문자(@$!%*#?&)를 포함해야 합니다.'
      };
    }
    
    return { isValid: true, message: '' };
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 유효성 검증
    const passwordValidation = validatePassword(userInfo.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

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
        phoneNumber: companyInfo.phoneNumber,
      };

      // 디버깅용 로그 추가
      console.log('회원가입 요청 데이터:', signupData);
      console.log('회원가입 API URL:', authService.getApiBaseUrl ? authService.getApiBaseUrl() : '(URL 함수 없음)');
      
      // API 요청 전송
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
          token: response.token || '',
        });

        router.push('/dashboard');
      } else {
        console.error(`예상과 다른 회원가입 응답 형식: ${JSON.stringify(response)}`);
        throw new Error(`예상과 다른 회원가입 응답 형식: ${JSON.stringify(response)}`);
      }
    } catch (error: unknown) {
      // 오류 응답 처리
      const err = error as {
        response?: { 
          status: number; 
          data?: ErrorResponse;
        };
        message?: string;
      };
      
      // 상세 오류 로깅
      console.error('회원가입 오류 전체:', error);
      
      if (err.response) {
        console.error('회원가입 응답 상태:', err.response.status);
        console.error('회원가입 응답 데이터:', err.response.data);
        
        // 409 오류: 이미 존재하는 이메일
        if (err.response.status === 409) {
          const errorMsg = '이미 사용 중인 이메일입니다';
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "회원가입 실패",
            description: errorMsg,
          });
        }
        // 400 오류: 유효성 검증 실패
        else if (err.response.status === 400) {
          const errorData = err.response.data;
          let errorMsg = '';
          
          // 백엔드의 ErrorResponse 형식에 맞게 처리
          if (errorData?.errors && errorData.errors.length > 0) {
            // ValidationError 배열 처리
            const validationMessages = errorData.errors.map(
              (ve: ValidationError) => `${ve.field}: ${ve.message}`
            ).join(', ');
            
            errorMsg = `입력값 유효성 검증에 실패했습니다: ${validationMessages}`;
          } else if (errorData?.message) {
            // 일반 오류 메시지 처리
            errorMsg = `요청 오류: ${errorData.message}`;
            
            // 일반적인 "입력값 검증에 실패했습니다" 메시지인 경우 더 구체적인 정보 제공
            if (errorData.message === '입력값 검증에 실패했습니다' || 
                errorData.message.includes('검증') || 
                errorData.message.includes('유효성')) {
              
              // 가능한 유효성 문제들을 안내
              const suggestedIssues = [
                '이메일 형식이 올바르지 않을 수 있습니다',
                '비밀번호가 요구사항을 충족하지 않습니다 (8~20자, 영문자/숫자/특수문자(@$!%*#?&) 각 하나 이상)',
                '사업자번호 형식이 올바르지 않을 수 있습니다 (예: 123-45-67890)',
                '전화번호 형식이 올바르지 않을 수 있습니다'
              ];
              
              errorMsg = `다음 사항을 확인해주세요: ${suggestedIssues.join('; ')}`;
            }
          } else {
            // 오류 데이터가 없는 경우 기본적인 안내 메시지 제공
            errorMsg = '입력 데이터 형식이 올바르지 않습니다. 다음 사항을 확인해주세요: ';
            errorMsg += '이메일 형식, 비밀번호 길이(8자 이상), 사업자번호 형식(123-45-67890), 전화번호 형식';
          }
          
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "회원가입 실패",
            description: errorMsg,
          });
        }
        // 그 외 서버 오류
        else {
          const errorData = err.response.data;
          const errorMsg = errorData?.message || '회원가입 처리 중 오류가 발생했습니다';
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "서버 오류",
            description: errorMsg,
          });
        }
      } else if (err.message) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "회원가입 실패",
          description: err.message,
        });
      } else {
        const errorMsg = '회원가입 처리 중 오류가 발생했습니다';
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "회원가입 실패",
          description: errorMsg,
        });
      }
    }
  };

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
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
            <p className="text-xs text-gray-500 mt-1">
              비밀번호는 8~20자, 영문자, 숫자, 특수문자(@$!%*#?&) 각 하나 이상 포함해야 합니다.
            </p>

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
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                이전
              </Button>
              <Button type="submit" className="flex-1">
                가입하기
              </Button>
            </div>
          </form>
        )}
      </AuthContainer>
      <Toaster />
    </>
  );
}
