import { LoginForm } from "@/app/(login)/login/login-form"

export default function Page() {
  return (
    <div className="flex items-center justify-center w-full p-6 min-h-svh md:p-10 bg-emerald-50">
      <div className="w-full max-w-sm">
         <LoginForm />
      </div>
    </div>
  )
}
