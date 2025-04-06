'use client';

import DashboardShell from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { Download, FileText, Plus, Building, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/toaster';
import api from '@/lib/api';

// 프레임워크 타입 정의
type SupportLevel = 'full' | 'partial' | 'coming';

interface Framework {
  id: string;
  name: string;
  description: string;
  supportLevel: SupportLevel;
}

// 현재는 GRI만 완전히 지원하고 다른 프레임워크도 추가
const frameworks: Framework[] = [
  {
    id: 'gri',
    name: 'GRI (Global Reporting Initiative)',
    description: '지속가능성 보고서 작성을 위한 글로벌 표준 프레임워크입니다.',
    supportLevel: 'full'
  },
  {
    id: 'sasb',
    name: 'SASB (Sustainability Accounting Standards Board)',
    description: '산업별 지속가능성 정보 공개를 위한 표준입니다.',
    supportLevel: 'partial'
  },
  {
    id: 'tcfd',
    name: 'TCFD (Task Force on Climate-related Financial Disclosures)',
    description: '기후변화 관련 재무정보 공개를 위한 프레임워크입니다.',
    supportLevel: 'coming'
  }
];

export default function ReportPage() {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(frameworks[0]);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const getSupportLevelBadge = (supportLevel: SupportLevel) => {
    switch (supportLevel) {
      case 'full':
        return <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">완전 지원</span>;
      case 'partial':
        return <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">부분 지원</span>;
      case 'coming':
        return <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">준비중</span>;
      default:
        return null;
    }
  };

  const downloadDocument = async (frameworkId: string, format = 'pdf', isCompanyReport = false) => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      setDownloadStatus(`${selectedFramework?.name || frameworkId} ${isCompanyReport ? '회사 보고서' : '문서'}를 ${format.toUpperCase()} 형식으로 다운로드 중입니다...`);
      
      let blob: Blob;
      let filename: string;
      
      // API 서비스 통해 문서 다운로드
      if (isCompanyReport) {
        blob = await api.documents.downloadCompanyReport(frameworkId, format as 'pdf' | 'docx');
        
        // 파일명 얻기 위한 헤더 정보 요청
        const response = await fetch(`/api/documents/company/${frameworkId}?format=${format}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        // 파일명 추출
        const contentDisposition = response.headers.get('Content-Disposition');
        filename = api.documents.getFilenameFromContentDisposition(
          contentDisposition,
          `${frameworkId}_company_report.${format}`
        );
      } else {
        blob = await api.documents.downloadFrameworkDocument(frameworkId, format as 'pdf' | 'docx');
        
        // 파일명 얻기 위한 헤더 정보 요청
        const response = await fetch(`/api/documents/${frameworkId}?format=${format}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        // 파일명 추출
        const contentDisposition = response.headers.get('Content-Disposition');
        filename = api.documents.getFilenameFromContentDisposition(
          contentDisposition,
          `${frameworkId}_document.${format}`
        );
      }
      
      // 파일 다운로드
      api.documents.downloadBlob(blob, filename);
      
      toast({
        description: `${filename} 파일이 다운로드되었습니다.`,
      });
    } catch (error) {
      // 오류 처리 유틸리티 사용
      api.error.handleApiError(error, {
        title: "다운로드 실패",
        showToast: true
      });
    } finally {
      setIsDownloading(false);
      
      // 다운로드 상태 표시 후 3초 후 제거
      setTimeout(() => {
        setDownloadStatus(null);
      }, 3000);
    }
  };

  const handleDownload = (framework: Framework, format: 'pdf' | 'docx', isCompanyReport = false) => {
    // 준비중인 프레임워크는 다운로드 비활성화
    if (framework.supportLevel === 'coming') {
      toast({
        variant: "default",
        title: "준비중인 기능",
        description: `${framework.name} 프레임워크는 현재 개발 중입니다.`,
      });
      return;
    }
    
    downloadDocument(framework.id, format, isCompanyReport);
  };

  return (
    <>
      <DashboardShell
        pageTitle="보고서 프레임워크"
        rightMenuItems={
          <div className="flex items-center space-x-2">
            {downloadStatus && (
              <span className="text-xs md:text-sm text-blue-600">
                {isDownloading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2 align-[-2px]" />
                )}
                {downloadStatus}
              </span>
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
                <div className="flex justify-between items-center mb-1">
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  {getSupportLevelBadge(framework.supportLevel)}
                </div>
                <CardDescription>{framework.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={framework.supportLevel === 'coming'}
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  {selectedFramework.name} 프레임워크
                </div>
                <div className="ml-2">
                  {getSupportLevelBadge(selectedFramework.supportLevel)}
                </div>
              </CardTitle>
              <CardDescription>프레임워크에 대한 상세 정보 및 관리 페이지입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                이 섹션에서는 선택한 프레임워크에 관련된 보고서 관리 및 생성 기능을 제공합니다.
              </p>
              
              {selectedFramework.supportLevel === 'coming' ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>준비 중인 프레임워크</AlertTitle>
                  <AlertDescription>
                    이 프레임워크는 현재 개발 중이며 곧 사용 가능해질 예정입니다.
                  </AlertDescription>
                </Alert>
              ) : (
                <Tabs defaultValue="standard" className="mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="standard">표준 문서</TabsTrigger>
                    <TabsTrigger value="company">회사별 보고서</TabsTrigger>
                  </TabsList>
                  <TabsContent value="standard" className="py-4">
                    <div className="space-y-4">
                      <p>프레임워크 표준 문서를 다운로드합니다. 이 문서는 표준 양식과 설명을 포함합니다.</p>
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          onClick={() => handleDownload(selectedFramework, 'pdf')}
                          disabled={isDownloading || selectedFramework?.supportLevel !== 'full' && selectedFramework?.supportLevel !== 'partial'}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          PDF로 다운로드
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleDownload(selectedFramework, 'docx')}
                          disabled={isDownloading || selectedFramework?.supportLevel !== 'full' && selectedFramework?.supportLevel !== 'partial'}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          DOCX로 다운로드
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="company" className="py-4">
                    <div className="space-y-4">
                      <p>
                        회사의 ESG 데이터를 포함한 맞춤형 보고서를 다운로드합니다. 
                        이 보고서는 귀사의 ESG 성과를 표시합니다.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          onClick={() => handleDownload(selectedFramework, 'pdf', true)}
                          disabled={isDownloading || selectedFramework?.supportLevel !== 'full' && selectedFramework?.supportLevel !== 'partial'}
                        >
                          <Building className="mr-2 h-4 w-4" />
                          회사 보고서 PDF
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleDownload(selectedFramework, 'docx', true)}
                          disabled={isDownloading || selectedFramework?.supportLevel !== 'full' && selectedFramework?.supportLevel !== 'partial'}
                        >
                          <Building className="mr-2 h-4 w-4" />
                          회사 보고서 DOCX
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              
              <Separator className="my-4" />
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">포함된 ESG 테이블</h3>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  <li>에너지 사용량 상세 (GRI 302-1)</li>
                  <li>환경투자 세부내용 (GRI 302-3)</li>
                  <li>에너지 비용 (GRI 302-1)</li>
                  <li>대기오염물질 배출농도 (GRI 305-7)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardShell>
      <Toaster />
    </>
  );
}
