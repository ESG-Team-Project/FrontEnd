'use client';

import { useState, useEffect } from 'react';
import LabeledInputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { authAtom, userAtom, loginAtom } from '@/lib/atoms/auth';
import type { AuthState, User } from '@/lib/atoms/auth';
import api from '@/lib/api';

export default function AccountForm() {
  // 현재 로그인한 사용자의 인증 정보 (예: 토큰)
  const [auth] = useAtom(authAtom);
  // 현재 로그인한 사용자의 정보. user는 사용자 객체, setUser는 사용자 정보 업데이트 함수
  const [user, setUser] = useAtom(userAtom);
  // 로그인 관련 로직을 실행하는 함수. 호출 시 내부적으로 토큰 및 사용자 정보를 갱신
  const [, login] = useAtom(loginAtom);

  // 사용자 입력값을 저장하는 상태 변수
  const [formData, setFormData] = useState<
    Partial<User & { password?: string; confirmPassword?: string }>
  >({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  // userAtom 값이 변경될 때마다 formData를 업데이트
  // 로그인한 사용자 정보(user)가 존재하면 formData 상태를 해당 사용자 정보로 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);   // user 값이 변경될 때마다 실행

  // 입력 필드(input)의 값이 변경될 때마다 호출되는 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;   // 입력 요소의 name 속성과 입력된 값
    setFormData((prevData: typeof formData) => ({
      ...prevData,      // 이전 상태를 복사
      [name]: value,    // 변경된 name 필드만 새로운 값으로 덮어씀
    }));
  };

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();   // 기본 제출 동작 방지

    // 1. 비밀번호 확인 유효성 검사
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 2. 인증 상태 검사 (로그인 여부 및 토큰 존재 확인)
    const currentAuth = auth as AuthState | null;
    if (!currentAuth || typeof currentAuth !== 'object' || !currentAuth.token) {
      alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
      console.error('handleSubmit Error: Invalid auth state', currentAuth);
      return;
    }
    const token = currentAuth.token;

    // 3. 서버에 전송할 사용자 정보 객체 생성
    const updateData: Partial<User> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    };

    // 비밀번호가 입력되었다면 포함 (선택적)
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      // 4. 사용자 정보 업데이트 요청(PUT)
      const updatedUserData = await api.user.updateUser(updateData);

      let finalUserData: User | null = null;
      if (updatedUserData && typeof updatedUserData === 'object' && updatedUserData.id) {
        finalUserData = updatedUserData;
      } else if (user) {
        finalUserData = {
          ...user,
          name: formData.name ?? user.name,
          email: formData.email ?? user.email,
          phoneNumber: formData.phoneNumber ?? user.phoneNumber,
        };
      }

      if (finalUserData) {
        login({ user: finalUserData, token: token });
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        console.warn('Could not determine updated user data after successful API call.');
        alert('프로필 업데이트는 성공했으나, 화면 갱신에 문제가 있을 수 있습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert(
        `프로필 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  };

  return (
    <form className="w-full max-w-4xl space-y-6" onSubmit={handleSubmit}>
      <LabeledInputBox
        label="담당자 이름"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      >
        담당자 이름을 입력하세요
      </LabeledInputBox>
      <LabeledInputBox
        label="이메일"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      >
        이메일 주소를 입력하세요
      </LabeledInputBox>
      <LabeledInputBox
        label="비밀번호"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      >
        변경하지 않으려면 비워두세요
      </LabeledInputBox>
      <LabeledInputBox
        label="비밀번호 확인"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      >
        변경하지 않으려면 비워두세요
      </LabeledInputBox>
      <LabeledInputBox
        label="휴대전화"
        name="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      >
        휴대전화 번호를 입력하세요
      </LabeledInputBox>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="w-[100px] mt-4 bg-black text-white hover:bg-white hover:text-black border border-black"
        >
          저장
        </Button>
      </div>
    </form>
  );
}
