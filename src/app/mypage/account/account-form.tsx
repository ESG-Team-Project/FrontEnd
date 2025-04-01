'use client';

import { useState, useEffect } from 'react';
import LabeledInputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/lib/atoms/auth';
import { useRouter } from 'next/navigation';

export default function AccountForm() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);
  const [user] = useAtom(userAtom);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  // 사용자 정보가 있으면 폼에 미리 채워넣기
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        phone: user.phone || '',
      });
    } else {
      // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 변경 시 일치 여부 확인
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      // API 요청 예시 (실제 구현에 맞게 수정 필요)
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined, // 비밀번호가 없으면 전송하지 않음
          phone: formData.phone,
        }),
      });
      
      if (!response.ok) {
        throw new Error('프로필 업데이트 실패');
      }
      
      const result = await response.json();
      
      // 업데이트된 사용자 정보로 jotai 상태 갱신
      setAuth({
        ...auth,
        user: {
          ...(auth.user || {}), // null 체크
          name: formData.name,
          email: formData.email,
          role: auth.user?.role || '',
          id: auth.user?.id || '',
          phone: formData.phone,
        }
      });
      
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
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
