export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-emerald-50">
      {children}
    </div>
  )
} 