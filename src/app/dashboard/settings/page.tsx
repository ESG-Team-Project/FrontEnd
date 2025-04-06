'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { dashboardColumnsAtom } from '@/lib/atoms';
import DashboardShell from '@/components/dashboard-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { getAuditLogs } from '@/lib/api/gri';
import { RefreshCw, User, Calendar, Clock, File, Database, Settings as SettingsIcon, Grid, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export default function SettingsPage() {
  const [dashboardColumns, setDashboardColumns] = useAtom(dashboardColumnsAtom);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const logs = await getAuditLogs('company', 'current');
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('감사 로그 로드 오류:', err);
      setError('감사 로그를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleColumnChange = (value: string) => {
    setDashboardColumns(value === '3' ? 3 : 4);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  // 액션 라벨 가져오기
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '생성';
      case 'UPDATE':
        return '수정';
      case 'DELETE':
        return '삭제';
      case 'LOGIN':
        return '로그인';
      case 'LOGOUT':
        return '로그아웃';
      default:
        return action;
    }
  };

  // 엔티티 타입 라벨 가져오기
  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'file':
        return <File className="w-4 h-4" />;
      case 'company':
        return <Database className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell 
      pageTitle="설정"
      rightMenuItems={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadAuditLogs}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          새로고침
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">대시보드 설정</h1>
        </div>
        
        <Separator />
        
        {/* 대시보드 설정 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              대시보드 레이아웃
            </CardTitle>
            <CardDescription>
              대시보드의 그리드 레이아웃을 조정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RadioGroup 
                defaultValue={dashboardColumns.toString()} 
                onValueChange={handleColumnChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 rounded-md border p-3 shadow-sm hover:bg-muted">
                  <RadioGroupItem value="3" id="r1" />
                  <div className="flex items-center gap-2">
                    <Grid className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="r1" className="font-medium">3열 레이아웃</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rounded-md border p-3 shadow-sm hover:bg-muted">
                  <RadioGroupItem value="4" id="r2" />
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="r2" className="font-medium">4열 레이아웃</Label>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-md">
                <p>대시보드 홈에서 차트와 위젯이 표시되는 열 수를 설정합니다.</p>
                <ul className="list-disc mt-2 ml-5">
                  <li><strong>3열 레이아웃</strong>: 더 큰 차트를 볼 수 있습니다.</li>
                  <li><strong>4열 레이아웃</strong>: 더 많은 차트를 한 번에 볼 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 감사 로그 카드 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                감사 로그
              </CardTitle>
              <CardDescription>
                시스템의 주요 이벤트와 변경 내역을 보여줍니다.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-sm bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
                <p className="font-semibold">오류 발생</p>
                <p>{error}</p>
              </div>
            ) : auditLogs.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <div className="w-full caption-bottom text-sm">
                  <table className="w-full">
                    <caption className="mt-4 text-sm text-muted-foreground">
                      최근 감사 로그 기록입니다.
                    </caption>
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[180px]">
                          날짜/시간
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          작업자
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          작업
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          대상
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                          상세 정보
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {formatDate(log.timestamp)}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-muted-foreground" />
                              {log.userName || log.userId || '알 수 없음'}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <span className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                              log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {getActionLabel(log.action)}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              {getEntityTypeIcon(log.entityType)}
                              <span className="ml-2">
                                {log.entityType} {log.entityId ? `(${log.entityId})` : ''}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle hidden md:table-cell max-w-xs truncate">
                            {log.details || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-center text-muted-foreground rounded-md border">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 mb-2 animate-spin text-primary" />
                    <p>감사 로그를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Clock className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p>감사 로그가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
} 