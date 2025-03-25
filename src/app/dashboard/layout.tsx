"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";
import Mainframe from "./mainframe";
import Charts from "./charts";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false); // Manage dark mode state

  return (
    <SidebarProvider>
      <div style={{ position: "relative" }}>
        {/* Switch component placed above the sidebar */}
        <SwitchDemo isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <AppSidebar />
      </div>
      <main
        style={{
          padding: "20px",
          backgroundColor: isDarkMode ? "#333" : "#fff", // 다크 모드 배경색 적용
          color: isDarkMode ? "#fff" : "#000", // 다크 모드 텍스트 색상 적용
          minHeight: "100vh", // 화면 전체 높이 유지
        }}
      >
        <SidebarTrigger />
        <ButtonDemo />

        <div style={{ marginBottom: "40px" }}>
          <Mainframe />
        </div>
        <Charts />
        {children}
      </main>
    </SidebarProvider>
  );
}

// Button component demo (positioned at the top-right corner)
export function ButtonDemo() {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
      }}
    >
      <Button>대시보드 시작하기</Button>
    </div>
  );
}

// Switch component demo (placed above the sidebar)
export function SwitchDemo({
  isDarkMode,
  setIsDarkMode,
}: {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px", // Positioned at the bottom-left corner
        left: "16px",
        zIndex: 10, // Ensure it appears above other elements
        backgroundColor: "#fff",
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3 className="mb-2 text-sm font-medium">다크 모드 설정</h3>
      <Switch
        checked={isDarkMode}
        onCheckedChange={(checked) => setIsDarkMode(checked)}
      />
    </div>
  );
}
