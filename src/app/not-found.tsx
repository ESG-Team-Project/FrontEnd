'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">페이지를 찾을 수 없습니다</h2>
      <p className="text-gray-600 max-w-md mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Link href="/dashboard">
        <Button className="bg-primary hover:bg-primary/90">홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
