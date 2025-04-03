import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { mobileOpenAtom } from '@/lib/atoms';

export default function MobileToggle() {
  const [isMobileOpen, setIsMobileOpen] = useAtom(mobileOpenAtom);

  // ESC 키를 누르면 모바일 메뉴를 닫음
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  // 모바일 메뉴 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 사이드바 요소와 토글 버튼 외 영역 클릭 시 닫기
      if (!target.closest('.sidebar') && !target.closest('.mobile-toggle')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, setIsMobileOpen]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-[14px] right-4 z-50 mobile-toggle"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );
} 