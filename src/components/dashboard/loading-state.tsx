import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = '데이터를 불러오는 중입니다...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p>{message}</p>
    </div>
  );
} 