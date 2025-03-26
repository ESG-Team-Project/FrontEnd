import NaviBar from "@/components/NaviBar";
import Scroll from "@/components/Scroll";
import CustomSidebar from "@/components/customsidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/mypageSidebar";
import { Building, User } from "lucide-react";

export default function Page() {
  const menuItems = [
    { title: "담당자 정보", url: "/", icon: User },
    { title: "회사 정보", url: "/mypage/company", icon: Building },
  ];

  return (
    <div className="flex flex-row">
      <div className="fixed left-0 min-h-screen bg-gradient-to-b from-emerald-100 to-white">
        <SidebarProvider className="flex flex-col justify-items-start">
          <AppSidebar items={menuItems} />
        </SidebarProvider>
      </div>
    </div>
  );
}
