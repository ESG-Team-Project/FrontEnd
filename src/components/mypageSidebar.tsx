import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  SidebarInset,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Item {
  title: string;
  url: string;
  icon: React.ElementType;
}
interface SidebarProps {
  items: Item[]; // 여러 개의 항목을 받도록 배열로 지정
}

export function AppSidebar({ items }: SidebarProps) {
  return (
    <SidebarInset>
      <SidebarMenu className="right-0 sticy">
        {items.map(({ title, url, icon: IconComponent }) => (
          <SidebarMenuItem key={title}>
            <SidebarMenuButton>
              <a href={url} className="flex items-center gap-2 h-fit">
                <IconComponent className="" /> {/* 아이콘 렌더링 */}
                <span className="flex flex-row">{title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarInset>
  );
}
