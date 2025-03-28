'use client';

import React, { useState } from 'react';
import LabeledInputBox from '@/components/labeled-inputbox';
import { Button } from '@/components/ui/button';

export default function AccountForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  return (
    <form className="w-full max-w-4xl space-y-6" onSubmit={handleSubmit}>
      <LabeledInputBox
        label="담당자 이름"
        type="text"
        value={formData.name}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="이메일"
        type="email"
        value={formData.email}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="비밀번호"
        type="password"
        value={formData.password}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="비밀번호 확인"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        direction="row"
        width="w-[400px]"
        labelWidth="w-[100px]"
        className="gap-4"
      />
      <LabeledInputBox
        label="휴대전화"
        type="tel"
        value={formData.phone}
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
