'use client';

import { useState, useEffect } from 'react';
import LabeledInputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { authAtom, userAtom, loginAtom } from '@/lib/atoms/auth';
import type { AuthState, User } from '@/lib/atoms/auth';
import api from '@/lib/api';

export default function AccountForm() {
    const [auth] = useAtom(authAtom);
    const [user, setUser] = useAtom(userAtom);
    const [, login] = useAtom(loginAtom);
  const [formData, setFormData] = useState<
      Partial<User & { password?: string; confirmPassword?: string }>
    >({
    companyName: '',
    ceoName: '',
    companyCode: '',
    companyPhoneNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || '',
        ceoName: user.ceoName || '',
        companyCode: user.ceoName ||'',
        companyPhoneNumber: user.companyPhoneNumber || '',
      });
    }
  }, [user]); // user 값이 변경될 때마다 실행

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        companyName: formData.companyName,
        ceoName: formData.ceoName,
        companyCode: formData.companyCode,
        companyPhoneNumber: formData.companyPhoneNumber,
      };
  
      if (formData.password) {
        updateData.password = formData.password;
      }
  
      try {
        // 4. 사용자 정보 업데이트 요청(PUT)
        const updatedUserData = await api.user.updateCompany(updateData);
  
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
        label="회사명"
        name="companyName"
        type="text"
        value={formData.companyName}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="대표자명"
        name='ceoName'
        type="text"
        value={formData.ceoName}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="사업자 등록 번호"
        name='companyCode'
        type="text"
        value={formData.companyCode}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="대표번호"
        name='companyPhoneNumber'
        type="tel"
        value={formData.companyPhoneNumber}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          className="mt-4 text-white bg-black border border-black w-1/8 hover:bg-white hover:text-black"
        >
          저장
        </Button>
      </div>
    </form>
  );
}
