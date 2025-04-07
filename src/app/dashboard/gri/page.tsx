'use client';

import DashboardShell from '@/components/dashboard-shell';
import GriEditForm from '@/components/gri-edit-form';
import { CustomButton } from '@/components/ui/custom-button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useDashboard } from '@/contexts/dashboard-context';
import { griCategories } from '@/data/griCategories';
import { griGroups } from '@/data/griGroups';
import { 
  getGriDataPaginated,
  type PageRequest,
  type PageResponse  
} from '@/lib/api/gri';
import enhancedGriService from '@/lib/api/gri/persistence';
import type { CompanyGRIData } from '@/types/companyGriData';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, AlertTriangle, CheckCircle2, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardGriEditPage() {
  const { companyId } = useDashboard();
  const [companyData, setCompanyData] = useState<CompanyGRIData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  
  // 마지막 데이터 업데이트 시간 추적
  const [lastDataUpdate, setLastDataUpdate] = useState<Date>(new Date());
  
  // 데이터 상태 추적
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 초기 상태 설정
    setIsOnline(navigator.onLine);
    
    // 주기적으로 보류 중인 변경사항 개수 업데이트
    const intervalId = setInterval(() => {
      setPendingChangesCount(enhancedGriService.getPendingChangesCount());
    }, 5000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // 데이터 로딩 함수
  const loadData = useCallback(async (showToast: boolean = false) => {
    if (!companyId) return;

    try {
      setIsLoadingData(true);
      if (showToast) {
        setIsRefreshing(true);
        toast({
          title: "데이터 새로고침",
          description: "최신 데이터를 가져오는 중...",
          variant: "default",
        });
      }
      setDataError(null);
      
      // 페이지네이션된 데이터 요청 (기존 방식 유지)
      const pageRequest: PageRequest = {
        page: currentPage,
        size: pageSize,
        sort: 'standardCode,asc'
      };
      
      // 온라인 상태에서만 페이지네이션 API 호출
      if (isOnline) {
        try {
          const pageResponse = await getGriDataPaginated(pageRequest);
          // 페이지네이션 정보 업데이트
          setTotalPages(pageResponse.totalPages);
          setTotalElements(pageResponse.totalElements);
        } catch (pageError) {
          console.error('페이지네이션 데이터 로드 실패:', pageError);
          // 페이지네이션 실패는 치명적이지 않으므로 계속 진행
        }
      }
      
      // 개선된 서비스를 사용하여 GRI 데이터 로드 (로컬 캐시 지원)
      const data = await enhancedGriService.getData();
      setCompanyData(data);
      
      // 데이터 업데이트 시간 기록
      const updateTime = new Date();
      setLastDataUpdate(updateTime);
      
      // 보류 중인 변경사항 개수 업데이트
      setPendingChangesCount(enhancedGriService.getPendingChangesCount());
      
      if (showToast) {
        toast({
          title: "새로고침 완료",
          description: `데이터가 성공적으로 업데이트되었습니다. (${updateTime.toLocaleTimeString()})`,
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error loading GRI data:', err);
      setDataError('GRI 데이터를 불러오는 중 오류가 발생했습니다.');
      
      if (showToast) {
        toast({
          title: "새로고침 실패",
          description: "데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  }, [companyId, currentPage, pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 수동 새로고침 핸들러
  const handleManualRefresh = () => {
    loadData(true);
  };
  
  // 보류 중인 변경사항 동기화 핸들러
  const handleSyncPendingChanges = async () => {
    if (!isOnline) {
      toast({
        title: "오프라인 상태",
        description: "인터넷 연결이 필요합니다. 연결 상태를 확인하세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const result = await enhancedGriService.syncPendingChanges();
      
      setPendingChangesCount(result.remaining);
      
      if (result.success) {
        toast({
          title: "동기화 완료",
          description: `${result.synced}개 항목이 성공적으로 동기화되었습니다.`,
          variant: "default",
        });
      } else {
        toast({
          title: "일부 동기화 완료",
          description: `${result.synced}개 성공, ${result.failed}개 실패, ${result.remaining}개 남음`,
          variant: "default",
        });
      }
      
      // 동기화 후 데이터 새로고침
      await loadData(false);
    } catch (error) {
      console.error('동기화 중 오류 발생:', error);
      toast({
        title: "동기화 실패",
        description: "변경사항 동기화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // GRI 데이터 변경 핸들러
  const handleGriDataChange = useCallback((updatedData: CompanyGRIData) => {
    // 로컬 상태 즉시 업데이트 (화면에 변경사항 바로 반영)
    setCompanyData(updatedData);
    // 데이터 업데이트 시간 기록
    setLastDataUpdate(new Date());
    // 보류 중인 변경사항 개수 업데이트
    setPendingChangesCount(enhancedGriService.getPendingChangesCount());
  }, []);

  // companyId가 변경될 때 데이터 로드
  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId, currentPage, pageSize, loadData]);
  
  // 데이터 주기적 자동 갱신 (5분마다)
  useEffect(() => {
    const refreshInterval = 5 * 60 * 1000; // 5분
    const intervalId = setInterval(() => {
      if (companyId && isOnline) {
        console.log('자동 데이터 갱신 실행 중...');
        loadData();
      }
    }, refreshInterval);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, [companyId, loadData, isOnline]);
  
  // 보류 중인 변경사항이 있고 온라인 상태가 되면 자동 동기화 시도
  useEffect(() => {
    if (isOnline && pendingChangesCount > 0 && !isSyncing) {
      console.log('온라인 상태 감지: 보류 중인 변경사항 자동 동기화 시도');
      handleSyncPendingChanges();
    }
  }, [isOnline, pendingChangesCount]);

  // 동기화 버튼 렌더링
  const renderSyncButton = () => {
    if (pendingChangesCount === 0) return null;
    
    return (
      <CustomButton
        onClick={handleSyncPendingChanges}
        variant="outline"
        disabled={isSyncing || !isOnline}
        className="flex items-center ml-2"
      >
        <Cloud className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
        {isSyncing ? '동기화 중...' : `동기화 (${pendingChangesCount})`}
      </CustomButton>
    );
  };

  return (
    <DashboardShell
      pageTitle="GRI 데이터 편집"
      manualStateHandling={true}
      isLoading={isLoadingData}
      error={dataError}
      onRetry={loadData}
      rightMenuItems={
        <div className="flex">
          <CustomButton 
            onClick={handleManualRefresh} 
            variant="outline" 
            disabled={isRefreshing || !isOnline}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '새로고침 중...' : '새로고침'}
          </CustomButton>
          {renderSyncButton()}
          {!isOnline && (
            <div className="flex items-center ml-2 text-amber-500">
              <CloudOff className="h-4 w-4 mr-1" />
              <span className="text-xs">오프라인</span>
            </div>
          )}
        </div>
      }
    >
      {pendingChangesCount > 0 && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>저장되지 않은 변경사항</AlertTitle>
          <AlertDescription>
            {pendingChangesCount}개의 변경사항이 서버에 완전히 저장되지 않았습니다. 
            {isOnline ? (
              <span> 동기화 버튼을 클릭하여 저장을 완료하세요.</span>
            ) : (
              <span> 인터넷 연결이 복원되면 자동으로 동기화됩니다.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {!isOnline && (
        <Alert variant="warning" className="mb-4">
          <CloudOff className="h-4 w-4" />
          <AlertTitle>오프라인 모드</AlertTitle>
          <AlertDescription>
            현재 오프라인 상태입니다. 변경사항은 로컬에 저장되며 인터넷 연결이 복원되면 서버와 동기화됩니다.
          </AlertDescription>
        </Alert>
      )}
      
      {companyData && (
        <>
          <GriEditForm
            initialData={companyData}
            griCategories={griCategories}
            griGroups={griGroups}
            onChange={handleGriDataChange}
            enhancedService={enhancedGriService}
            isOnline={isOnline}
          />
          
          {/* 페이지네이션 UI 추가 */}
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage > 0) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {/* 페이지 번호 표시 - 최대 5개 페이지만 표시 */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // 현재 페이지를 중심으로 페이지 번호 계산
                  const pageNum = Math.max(0, Math.min(
                    currentPage - 2 + i, 
                    totalPages - 1
                  ));
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          
          {/* 페이지 정보 표시 */}
          <div className="mt-2 text-center text-sm text-gray-500">
            전체 {totalElements}개 항목 중 {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
            {lastDataUpdate && (
              <span className="ml-2">
                (마지막 업데이트: {lastDataUpdate.toLocaleTimeString()})
              </span>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
