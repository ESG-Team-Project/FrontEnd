'use client'

import { Button } from '@/components/ui/button'
import InputBox from '@/components/labeled-inputbox'
import Link from 'next/link'
import AuthContainer from '../AuthContainer'

export function LoginForm() {
	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault()
		alert("로그인 시도")
	}

	return (
		<AuthContainer
			title="Login"
			footerContent={
				<p className="w-full text-sm text-center">
					계정이 없으신가요?{' '}
					<Link href="/signup" className="text-blue-600 hover:underline">
						회원가입
					</Link>
				</p>
			}
		>
			<form className="space-y-4" onSubmit={handleLogin}>
				<InputBox label="이메일" type="email">
					you@example.com
				</InputBox>
				<InputBox label="비밀번호" type="password" >
					********
				</InputBox>
				<Button type="submit" className="w-full text-white bg-(--color-primary-foreground)">
					로그인
				</Button>
			</form>
		</AuthContainer>
	)
}
