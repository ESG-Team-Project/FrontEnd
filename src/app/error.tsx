'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 로깅하거나 보고할 수 있음
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
      <p className="text-gray-600 max-w-md mb-8">
        예상치 못한 오류가 발생했습니다. 다시 시도하거나 관리자에게 문의해주세요.
      </p>
      <Button 
        onClick={reset}
        className="bg-primary hover:bg-primary/90"
      >
        다시 시도하기
      </Button>
    </div>
  );
} 