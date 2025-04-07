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
  getCompanyGriDataFormatted, 
  getGriDataPaginated,
  saveCompanyGriDataFormatted,
  type PageRequest,
  type PageResponse  
} from '@/lib/api/gri';
import type { CompanyGRIData } from '@/types/companyGriData';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw } from 'lucide-react';

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
      
      // 페이지네이션된 데이터 요청
      const pageRequest: PageRequest = {
        page: currentPage,
        size: pageSize,
        sort: 'standardCode,asc'
      };
      
      // 새로운 페이지네이션 API 호출 - JWT 토큰에서 회사 ID 자동 사용
      const pageResponse = await getGriDataPaginated(pageRequest);
      
      // 페이지네이션 정보 업데이트
      setTotalPages(pageResponse.totalPages);
      setTotalElements(pageResponse.totalElements);
      
      // 기존 데이터 초기화 후 새 데이터 가져오기 (캐시 무시)
      setCompanyData(null);
      const data = await getCompanyGriDataFormatted();
      setCompanyData(data);
      
      // 데이터 업데이트 시간 기록
      const updateTime = new Date();
      setLastDataUpdate(updateTime);
      
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
  
  // GRI 데이터 변경 핸들러
  const handleGriDataChange = useCallback((updatedData: CompanyGRIData) => {
    // 로컬 상태 즉시 업데이트 (화면에 변경사항 바로 반영)
    setCompanyData(updatedData);
    // 데이터 업데이트 시간 기록
    setLastDataUpdate(new Date());
    
    // 5초 후에 서버에서 데이터를 다시 로드하여 변경 사항이 서버에 반영되었는지 확인
    const timeoutId = setTimeout(() => {
      console.log("변경 후 자동 새로고침 실행");
      loadData();
    }, 5000);
    
    // 컴포넌트 언마운트 시 타이머 해제
    return () => clearTimeout(timeoutId);
  }, [loadData]);

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
      if (companyId) {
        console.log('자동 데이터 갱신 실행 중...');
        loadData();
      }
    }, refreshInterval);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, [companyId, loadData]);

  return (
    <DashboardShell
      pageTitle="GRI 데이터 편집"
      manualStateHandling={true}
      isLoading={isLoadingData}
      error={dataError}
      onRetry={loadData}
    >
      {companyData && (
        <>
          <div className="flex justify-end mb-4">
            <CustomButton 
              onClick={handleManualRefresh} 
              variant="outline" 
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? '새로고침 중...' : '데이터 새로고침'}
            </CustomButton>
          </div>
          
          <GriEditForm
            initialData={companyData}
            griCategories={griCategories}
            griGroups={griGroups}
            onChange={handleGriDataChange}
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
