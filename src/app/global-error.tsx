'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">치명적인 오류가 발생했습니다</h1>
          <p className="text-gray-600 max-w-md mb-8">
            예상치 못한 오류가 발생했습니다. 다시 시도하거나 관리자에게 문의해주세요.
          </p>
          <Button onClick={reset} className="bg-primary hover:bg-primary/90">
            다시 시도하기
          </Button>
        </div>
      </body>
    </html>
  );
}
