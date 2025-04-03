import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuthRequiredProps {
  message?: string;
}

export function AuthRequired({
  message = '이 페이지를 이용하려면 로그인이 필요합니다.',
}: AuthRequiredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <User className="w-8 h-8 text-muted-foreground mb-4" />
      <p className="mb-6 text-center">{message}</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="default">로그인</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">홈으로</Button>
        </Link>
      </div>
    </div>
  );
}
