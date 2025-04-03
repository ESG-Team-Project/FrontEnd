'use client';

import { useState, useEffect } from 'react';
import LabeledInputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { authAtom, userAtom, loginAtom } from '@/lib/atoms/auth';
import type { AuthState, User } from '@/lib/atoms/auth';

export default function AccountForm() {
  const [auth] = useAtom(authAtom);
  const [user, setUser] = useAtom(userAtom);
  const [, login] = useAtom(loginAtom);
  
  const [formData, setFormData] = useState<Partial<User & { password?: string, confirmPassword?: string }>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: typeof formData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    const currentAuth = auth as AuthState | null;
    if (!currentAuth || typeof currentAuth !== 'object' || !currentAuth.token) {
        alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        console.error('handleSubmit Error: Invalid auth state', currentAuth);
        return; 
    }
    const token = currentAuth.token;

    const updateData: Partial<User> & { password?: string } = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
    };
    if (formData.password) {
        updateData.password = formData.password;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '프로필 업데이트 실패' }));
        throw new Error(errorData.message || '프로필 업데이트 실패');
      }
      
      const updatedUserData = await response.json();
      
      let finalUserData: User | null = null;
      if (updatedUserData && typeof updatedUserData === 'object' && updatedUserData.id) {
          finalUserData = updatedUserData as User;
      } else if (user) {
          finalUserData = {
              ...user,
              name: formData.name ?? user.name,
              email: formData.email ?? user.email,
              phone: formData.phone ?? user.phone,
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
      alert(`프로필 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <form className="space-y-6 w-full max-w-4xl" onSubmit={handleSubmit}>
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
        name="phone"
        type="tel"
        value={formData.phone}
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
