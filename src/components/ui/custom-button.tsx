'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import { ReactNode, forwardRef } from 'react';

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * 기본 Button 컴포넌트를 개선한 커스텀 버튼
 * - 텍스트와 배경 색상의 대비를 높여 가독성 개선
 */
const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    // variant에 따른 색상 클래스 정의
    let colorClass = '';

    switch (variant) {
      case 'default':
        // 프라이머리 버튼 - 짙은 파란색 배경에 흰색 텍스트
        colorClass = 'bg-blue-600 text-white hover:bg-blue-700';
        break;
      case 'destructive':
        // 비구조적 변경 없음 (이미 충분한 대비)
        break;
      case 'outline':
        // 아웃라인 - 흰색 배경에 짙은 텍스트, 테두리 강화
        colorClass = 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100';
        break;
      case 'secondary':
        // 세컨더리 - 밝은 회색 배경에 짙은 텍스트
        colorClass = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
        break;
      case 'ghost':
        // 고스트 - 투명 배경, 짙은 텍스트
        colorClass = 'text-gray-700 hover:bg-gray-100';
        break;
      case 'link':
        // 링크 - 텍스트 컬러 강화
        colorClass = 'text-blue-600 hover:text-blue-800';
        break;
      default:
        break;
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(colorClass, className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export { CustomButton };
