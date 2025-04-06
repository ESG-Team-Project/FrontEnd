import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 클래스 이름을 조건부로 결합하고 TailwindCSS 클래스 충돌을 해결하는 유틸리티 함수
 * 
 * @param inputs - 조건부 클래스 이름 배열
 * @returns 병합된 클래스 이름 문자열
 * 
 * @example
 * ```tsx
 * <div className={cn(
 *   "flex items-center",
 *   isActive && "bg-blue-500 text-white",
 *   size === "sm" && "text-sm"
 * )}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
