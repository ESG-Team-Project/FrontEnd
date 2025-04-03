import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import Link from 'next/link';

import {
  SidebarInset,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

interface Item {
  title: string;
  url: string;
  icon: React.ElementType;
}
interface SidebarProps {
  items: Item[]; // 여러 개의 항목을 받도록 배열로 지정
}

export function AppSidebar({ items }: SidebarProps) {
  const location = usePathname();
  // console.log(location); // 디버깅 로그 제거 또는 주석 처리
  return (
    <SidebarInset>
      <SidebarMenu className="pl-2 w-max">
        {items.map(({ title, url, icon: IconComponent }) => (
          <SidebarMenuItem key={title} className="w-full">
            <Link href={url} legacyBehavior passHref>
              <SidebarMenuButton
                as="a"
                className={
                  location === url
                    ? 'h-full w-full rounded-l-md shadow-[-12px_0px_6px_-5px_#1a202c] bg-gray-50'
                    : 'h-full w-full rounded-l-md'
                }
              >
                <IconComponent className="w-10 h-10" />
                <span className="w-full text-2xl text-center">{title}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarInset>
  );
}
