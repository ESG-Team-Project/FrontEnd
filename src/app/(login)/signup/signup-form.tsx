"use client";

<<<<<<< HEAD
import { useState } from "react"
import { Button } from "@/components/ui/button"
import LabeledInputBox from "@/components/labeled-inputbox"
import Link from "next/link"
import AuthContainer from '../AuthContainer'

export function SignUpForm() {
    const [step, setStep] = useState(1)

    const next = () => setStep((prev) => prev + 1)
=======
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import InputBox from "@/components/labeled-inputbox";
import Link from "next/link";

export function SignUpForm() {
  const [step, setStep] = useState(1);

  const next = () => setStep((prev) => prev + 1);
>>>>>>> d208986 (차트추가 스크롤, 검색해결)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("회원가입 완료");
  };

<<<<<<< HEAD
    return (
        <AuthContainer
            title="Sign Up"
            footerContent={
                <p className="w-full text-sm text-center">
                    이미 계정을 가지고 계신가요?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        로그인
                    </Link>
                </p>
            }
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                {step === 1 && (
                    <>
                        <LabeledInputBox label="이메일" type="email">
                            you@example.com
                        </LabeledInputBox>
                        <LabeledInputBox label="비밀번호" type="password" />
                        <LabeledInputBox label="비밀번호 확인" type="password"/>
                    </>
                )}

                {step === 2 && (
                    <>
                        <LabeledInputBox label="회사명" type="string" />
                        <LabeledInputBox label="대표자명" type="string" />
                        <LabeledInputBox label="사업자 등록번호" type="string" />
                        <LabeledInputBox label="대표번호" type="string" />
                        <LabeledInputBox label="담당자명" type="string" />
                        <LabeledInputBox label="전화번호" type="string" />
                    </>
                )}

                <div className="flex gap-2">
                    {step === 1 && (
                        <Button type="button" className="w-full text-white bg-emerald-600 hover:bg-emerald-700" onClick={next}>
                            다음
                        </Button>
                    )}
                    {step === 2 && (
                        <Button type="submit" className="w-full text-white bg-emerald-600 hover:bg-emerald-700">
                            회원가입
                        </Button>
                    )}
                </div>
            </form>
        </AuthContainer>
    )
=======
  return (
    <div className="flex items-center justify-center w-full p-6 min-h-auto md:p-3">
      <div className="w-full max-w-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl text-(--color-primary)">
                Sign Up
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <InputBox label="Email" type="email">
                    you@example.com
                  </InputBox>
                  <InputBox label="Password" type="password" />
                  <InputBox label="Check Password" type="password" />
                </>
              )}

              {step === 2 && (
                <>
                  <InputBox label="회사명" type="string" />
                  <InputBox label="대표자명" type="string" />
                  <InputBox label="사업자 등록번호" type="string" />
                  <InputBox label="대표번호" type="string" />
                  <InputBox label="담당자명" type="string" />
                  <InputBox label="전화번호" type="string" />
                </>
              )}

              <div className="flex gap-2">
                {step === 1 && (
                  <Button
                    type="button"
                    className="w-full text-white bg-(--color-primary-foreground)"
                    onClick={next}
                  >
                    다음
                  </Button>
                )}
                {step === 2 && (
                  <Button
                    type="submit"
                    className="w-full text-white bg-(--color-primary-foreground)"
                  >
                    회원가입
                  </Button>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <p className="w-full text-sm text-center">
                이미 계정을 가지고 계신가요?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  로그인
                </Link>
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
>>>>>>> d208986 (차트추가 스크롤, 검색해결)
}
