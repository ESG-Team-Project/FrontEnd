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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <LabeledInputBox
        label="담당자 이름"
        type="text"
        value={formData.name}
        onChange={handleChange}
        direction="row"
      />
      <LabeledInputBox
        label="이메일"
        type="email"
        value={formData.email}
        onChange={handleChange}
        direction="row"
      />
      <LabeledInputBox
        label="비밀번호"
        type="password"
        value={formData.password}
        onChange={handleChange}
        direction="row"
      />
      <LabeledInputBox
        label="비밀번호 확인"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        direction="row"
      />
      <LabeledInputBox
        label="휴대전화"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        direction="row"
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          className="w-1/8 mt-4 bg-black text-white hover:bg-white hover:text-black border border-black"
        >
          저장
        </Button>
      </div>
    </form>
  );
}
