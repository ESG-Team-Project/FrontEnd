"use client";

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Plus } from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";
import { CustomButton } from "@/components/ui/custom-button";

// 프레임워크 타입 정의
type Framework = {
  id: string;
  name: string;
  description: string;
  documentUrl: string;
};

// 현재는 GRI만 있지만 추후 확장 가능한 구조로 설계
const frameworks: Framework[] = [
  {
    id: "gri",
    name: "GRI (Global Reporting Initiative)",
    description: "지속가능성 보고서 작성을 위한 글로벌 표준 프레임워크입니다.",
    documentUrl: "/documents/gri_framework.pdf",
  },
];

export default function ReportPage() {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(
    frameworks[0]
  );
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const handleDownload = (framework: Framework) => {
    // 실제 환경에서는 프레임워크 문서 다운로드 로직 구현
    console.log(`Downloading ${framework.name} document from ${framework.documentUrl}`);
    setDownloadStatus(`${framework.name} 문서를 다운로드 중입니다...`);
    
    // 실제 다운로드
    window.open(framework.documentUrl, "_blank");
    
    // 다운로드 상태 표시 후 3초 후 제거
    setTimeout(() => {
      setDownloadStatus(null);
    }, 3000);
  };

  const createReport = () => {
    // 보고서 생성 기능 구현 (향후 추가)
    console.log("보고서 생성");
  };

  return (
    <DashboardShell
      pageTitle="보고서 프레임워크"
      rightMenuItems={
        <div className="flex items-center space-x-2">
          {downloadStatus && (
            <span className="text-xs md:text-sm text-blue-600">
              {downloadStatus}
            </span>
          )}
          <CustomButton
            variant="outline"
            className="bg-white text-xs md:text-sm px-2 md:px-4 h-8 md:h-9"
            onClick={createReport}
          >
            <Plus className="mr-2 h-4 w-4" />
            새 보고서
          </CustomButton>
        </div>
      }
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">사용 가능한 프레임워크</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {frameworks.map((framework) => (
          <Card 
            key={framework.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFramework?.id === framework.id
                ? "border-primary shadow-lg"
                : ""
            }`}
            onClick={() => setSelectedFramework(framework)}
          >
            <CardHeader>
              <CardTitle>{framework.name}</CardTitle>
              <CardDescription>{framework.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(framework);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                문서 다운로드
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFramework && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              {selectedFramework.name} 프레임워크
            </CardTitle>
            <CardDescription>
              프레임워크에 대한 상세 정보 및 관리 페이지입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              이 섹션에서는 선택한 프레임워크에 관련된 보고서 관리 및 생성 기능을 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => window.location.href = `/dashboard/${selectedFramework.id}`}>
                프레임워크 관리
              </Button>
              <Button variant="outline" onClick={() => handleDownload(selectedFramework)}>
                <Download className="mr-2 h-4 w-4" />
                문서 다운로드
              </Button>
              <Button variant="secondary" onClick={createReport}>
                <Plus className="mr-2 h-4 w-4" />
                새 보고서 작성
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
} 