'use client';

import DashboardShell from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { Download, FileText, Plus } from 'lucide-react';
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
    id: 'gri',
    name: 'GRI (Global Reporting Initiative)',
    description: '지속가능성 보고서 작성을 위한 글로벌 표준 프레임워크입니다.',
    documentUrl: '/documents/gri_framework.pdf',
  },
];

export default function ReportPage() {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(frameworks[0]);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const handleDownload = (framework: Framework, format: 'pdf' | 'docx') => {
    // 실제 환경에서는 프레임워크 문서 다운로드 로직 구현
    console.log(`Downloading ${framework.name} document in ${format.toUpperCase()} format`);
    setDownloadStatus(`${framework.name} 문서를 ${format.toUpperCase()} 형식으로 다운로드 중입니다...`);

    // 실제 다운로드 - 형식에 따라 다른 URL 처리
    let downloadUrl = framework.documentUrl;
    if (format === 'docx') {
      // docx 파일 URL로 변경 (예시)
      downloadUrl = downloadUrl.replace('.pdf', '.docx');
    }
    window.open(downloadUrl, '_blank');

    // 다운로드 상태 표시 후 3초 후 제거
    setTimeout(() => {
      setDownloadStatus(null);
    }, 3000);
  };

  return (
    <DashboardShell
      pageTitle="보고서 프레임워크"
      rightMenuItems={
        <div className="flex items-center space-x-2">
          {downloadStatus && (
            <span className="text-xs md:text-sm text-blue-600">{downloadStatus}</span>
          )}
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
              selectedFramework?.id === framework.id ? 'border-primary shadow-lg' : ''
            }`}
            onClick={() => setSelectedFramework(framework)}
          >
            <CardHeader>
              <CardTitle>{framework.name}</CardTitle>
              <CardDescription>{framework.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    문서 다운로드
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(framework, 'pdf');
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" /> PDF 형식
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(framework, 'docx');
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" /> DOCX 형식
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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
            <CardDescription>프레임워크에 대한 상세 정보 및 관리 페이지입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              이 섹션에서는 선택한 프레임워크에 관련된 보고서 관리 및 생성 기능을 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => {
                window.location.href = `/dashboard/${selectedFramework.id}`;
              }}>
                데이터 관리
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    문서 다운로드
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => handleDownload(selectedFramework, 'pdf')}
                    >
                      <FileText className="mr-2 h-4 w-4" /> PDF 형식
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => handleDownload(selectedFramework, 'docx')}
                    >
                      <FileText className="mr-2 h-4 w-4" /> DOCX 형식
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
