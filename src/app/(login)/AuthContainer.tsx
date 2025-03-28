'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  footerContent: React.ReactNode;
}

export default function AuthContainer({ children, title, footerContent }: AuthContainerProps) {
  return (
    <div className="flex items-center justify-center w-full p-6 min-h-auto md:p-3">
      <div className="w-full max-w-sm">
        <div className="space-y-4">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-4xl font-bold text-emerald-600">{title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">{children}</CardContent>

            <CardFooter>{footerContent}</CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
