export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

        <div className="flex flex-col items-center min-w-full min-h-full">
            {children}
        </div>
  );
}
