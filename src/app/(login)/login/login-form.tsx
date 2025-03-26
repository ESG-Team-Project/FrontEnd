import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import InputBox from '@/components/labeled-inputbox'
import Link from 'next/link'

export function LoginForm() {
	return (
		<div className="flex items-center justify-center w-full p-6 min-h-auto md:p-3">
			<div className="w-full max-w-sm">
				<form className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-4xl text-(--color-primary)">Login</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">
							<InputBox label="Email" type="email">
								you@example.com
							</InputBox>
							<InputBox label="Password" type="password" />
							<Button type="submit" className="w-full text-white bg-(--color-primary-foreground) ">
								로그인
							</Button>
						</CardContent>

						<CardFooter>
							<p className="w-full text-sm text-center">
								계정이 없으신가요?{' '}
								<Link href="/signup" className="text-blue-600 hover:underline">
									회원가입
								</Link>
							</p>
						</CardFooter>
					</Card>
				</form>
			</div>
		</div>
	)
}
