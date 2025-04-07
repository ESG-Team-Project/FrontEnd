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
import { useState, useCallback, useRef } from 'react';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
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

  // 오류 발생시 처리하는 함수 추가
  const clearFieldErrors = () => {
    setFieldErrors({});
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

  // 이메일 중복 체크 함수
  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return false;
    }

    try {
      setIsEmailChecking(true);
      const response = await authService.checkEmailAvailabilityGet(email);
      console.log('이메일 중복 체크 응답:', response);
      return response.available;
    } catch (error) {
      console.error('이메일 중복 체크 오류:', error);
      return false;
    } finally {
      setIsEmailChecking(false);
    }
  };

  // 디바운싱된 이메일 검증 함수
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedCheckEmail = useCallback(
    async (email: string) => {
      // 이전 타이머가 있으면 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 새로운 타이머 설정 (500ms 디바운스)
      timeoutRef.current = setTimeout(async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          setFieldErrors(prev => ({
            ...prev,
            email: '유효한 이메일 주소를 입력해주세요'
          }));
          setIsEmailAvailable(null);
          return;
        }

        try {
          const isAvailable = await checkEmailAvailability(email);
          setIsEmailAvailable(isAvailable);
          
          if (!isAvailable) {
            setFieldErrors(prev => ({
              ...prev,
              email: '이미 사용 중인 이메일입니다'
            }));
          } else {
            setFieldErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('이메일 검증 오류:', error);
          setFieldErrors(prev => ({
            ...prev,
            email: '이메일 확인 중 오류가 발생했습니다'
          }));
          setIsEmailAvailable(null);
        }
      }, 500);
    },
    []
  );

  // 이메일 입력 변경 핸들러를 수정하여 중복 체크 기능 포함
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setUserInfo(prev => ({ ...prev, [name]: value }));
    
    // 이메일 필드인 경우 유효성 검사 초기화
    if (name === 'email') {
      setIsEmailAvailable(null);
      // 이메일이 입력되었을 때 유효성 검사 필드 오류 초기화
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  // 이메일 필드의 blur 이벤트 핸들러
  const handleEmailBlur = () => {
    if (userInfo.email) {
      debouncedCheckEmail(userInfo.email);
    }
  };

  // handleUserInfoSubmit을 수정하여 이메일 중복 체크 결과 확인
  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearFieldErrors();

    // 이메일 유효성 검증
    if (!userInfo.email || !/\S+@\S+\.\S+/.test(userInfo.email)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        email: '유효한 이메일 주소를 입력해주세요' 
      }));
      setError('일부 입력 항목에 오류가 있습니다. 수정 후 다시 시도해주세요.');
      return;
    }

    // 이메일 중복 체크 (아직 체크하지 않았거나 중복일 경우)
    if (isEmailAvailable === null || isEmailAvailable === false) {
      try {
        setIsEmailChecking(true);
        const isAvailable = await checkEmailAvailability(userInfo.email);
        setIsEmailAvailable(isAvailable);
        
        if (!isAvailable) {
          setFieldErrors(prev => ({ 
            ...prev, 
            email: '이미 사용 중인 이메일입니다' 
          }));
          setError('이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.');
          setIsEmailChecking(false);
          return;
        }
      } catch (error) {
        console.error('이메일 확인 오류:', error);
        setFieldErrors(prev => ({ 
          ...prev, 
          email: '이메일 확인 중 오류가 발생했습니다' 
        }));
        setError('이메일 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsEmailChecking(false);
        return;
      }
      setIsEmailChecking(false);
    }

    // 비밀번호 유효성 검증
    const passwordValidation = validatePassword(userInfo.password);
    if (!passwordValidation.isValid) {
      setFieldErrors(prev => ({ 
        ...prev, 
        password: passwordValidation.message 
      }));
      setError('일부 입력 항목에 오류가 있습니다. 수정 후 다시 시도해주세요.');
      return;
    }

    // 비밀번호 확인
    if (userInfo.password !== userInfo.confirmPassword) {
      setFieldErrors(prev => ({ 
        ...prev, 
        confirmPassword: '비밀번호가 일치하지 않습니다' 
      }));
      setError('일부 입력 항목에 오류가 있습니다. 수정 후 다시 시도해주세요.');
      return;
    }

    // 다음 단계로 이동
    setStep(2);
  };

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearFieldErrors();

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
            variant: "error",
            title: "회원가입 실패",
            description: errorMsg,
          });
        }
        // 400 오류: 유효성 검증 실패
        else if (err.response.status === 400) {
          const errorData = err.response.data;
          let errorMsg = '입력값 검증에 실패했습니다. 아래 표시된 오류를 확인해주세요.';
          clearFieldErrors();
          
          // 백엔드의 ErrorResponse 형식에 맞게 처리
          if (errorData?.errors) {
            // 객체 형태인 경우 (현재 백엔드 응답)
            if (typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
              const newFieldErrors: Record<string, string> = {};
              Object.entries(errorData.errors).forEach(([field, message]) => {
                newFieldErrors[field] = message as string;
              });
              setFieldErrors(newFieldErrors);
            } 
            // 배열 형태인 경우
            else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
              const newFieldErrors: Record<string, string> = {};
              errorData.errors.forEach((error: ValidationError) => {
                newFieldErrors[error.field] = error.message;
              });
              setFieldErrors(newFieldErrors);
            }
            
            // 필드 오류 없을 경우만 일반 오류 메시지 설정
            if (Object.keys(fieldErrors).length === 0 && errorData?.message) {
              errorMsg = errorData.message;
              
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
            } else if (errorData?.message) {
              errorMsg = errorData.message;
            }
          } else if (errorData?.message) {
            errorMsg = errorData.message;
          }
          
          setError(errorMsg);
          toast({
            variant: "error",
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
            variant: "error",
            title: "서버 오류",
            description: errorMsg,
          });
        }
      } else if (err.message) {
        setError(err.message);
        toast({
          variant: "error",
          title: "회원가입 실패",
          description: err.message,
        });
      } else {
        const errorMsg = '회원가입 처리 중 오류가 발생했습니다';
        setError(errorMsg);
        toast({
          variant: "error",
          title: "회원가입 실패",
          description: errorMsg,
        });
      }
    }
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
              onBlur={handleEmailBlur}
              error={fieldErrors.email}
              required={true}
            >
              you@example.com
            </InputBox>

            {isEmailChecking && (
              <div className="text-sm text-gray-500">이메일 확인 중...</div>
            )}
            
            {isEmailAvailable && !isEmailChecking && userInfo.email && (
              <div className="text-sm text-green-600">사용 가능한 이메일입니다</div>
            )}

            <InputBox
              label="이름"
              name="name"
              type="text"
              value={userInfo.name}
              onChange={handleUserInfoChange}
              required={true}
              error={fieldErrors.name}
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
              error={fieldErrors.password}
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
              error={fieldErrors.confirmPassword}
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
              error={fieldErrors.companyName}
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
              error={fieldErrors.ceoName}
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
              error={fieldErrors.companyCode}
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
              error={fieldErrors.companyPhoneNumber}
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
              error={fieldErrors.phoneNumber}
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
