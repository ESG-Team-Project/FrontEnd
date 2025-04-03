import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = '오류가 발생했습니다.', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
      <p className="text-destructive mb-4">{message}</p>
      {onRetry && (
        <Button 
          variant="outline"
          onClick={onRetry}
          className="px-4 py-2"
        >
          다시 시도
        </Button>
      )}
    </div>
  );
} 