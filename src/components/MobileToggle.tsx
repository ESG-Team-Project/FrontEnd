'use client';

// import { useAtom } from 'jotai';
// import { mobileOpenAtom } from '@/lib/atoms';
// import { Button } from './ui/button';
// import { Menu, X } from 'lucide-react';

// 이 컴포넌트는 dashboard-top-bar.tsx로 기능이 이전되었으므로 비활성화합니다.
export default function MobileToggle() {
  // const [isOpen, setIsOpen] = useAtom(mobileOpenAtom);
  // const toggle = () => setIsOpen(prev => !prev);

  return null; // 아무것도 렌더링하지 않음

  /* 기존 코드 (주석 처리)
  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden mr-2">
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
  */
}
