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
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
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
      />
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
      />
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
      />
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
      />
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
      />

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
