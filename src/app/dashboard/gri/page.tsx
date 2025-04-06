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

  // 데이터 로딩 함수
  const loadData = useCallback(async () => {
    if (!companyId) return;

    try {
      setIsLoadingData(true);
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
      
      // 데이터 가져오기
      const data = await getCompanyGriDataFormatted();
      setCompanyData(data);
    } catch (err) {
      console.error('Error loading GRI data:', err);
      setDataError('GRI 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingData(false);
    }
  }, [companyId, currentPage, pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // companyId가 변경될 때 데이터 로드
  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId, currentPage, pageSize, loadData]);

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
          <GriEditForm
            initialData={companyData}
            griCategories={griCategories}
            griGroups={griGroups}
            onChange={setCompanyData}
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
          </div>
        </>
      )}
    </DashboardShell>
  );
}
