'use client';

import { useState, useEffect, useCallback } from 'react';
import GriEditForm from '@/components/gri-edit-form';
import { griCategories } from '@/data/griCategories';
import { griGroups } from '@/data/griGroups';
import type { CompanyGRIData } from '@/types/companyGriData';
import DashboardShell from '@/components/dashboard-shell';
import { useDashboard } from '@/contexts/dashboard-context';
import { CustomButton } from '@/components/ui/custom-button';
import { getCompanyGriData, saveCompanyGriData } from '@/services/api/gri-service';

export default function DashboardGriEditPage() {
  const { companyId } = useDashboard();
  const [companyData, setCompanyData] = useState<CompanyGRIData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // 데이터 로딩 함수
  const loadData = useCallback(async () => {
    if (!companyId) return;

    try {
      setIsLoadingData(true);
      setDataError(null);
      const data = await getCompanyGriData(companyId);
      setCompanyData(data);
    } catch (err) {
      console.error('Error loading GRI data:', err);
      setDataError('GRI 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingData(false);
    }
  }, [companyId]);

  // companyId가 변경될 때 데이터 로드
  useEffect(() => {
    if (companyId) {
      loadData();
    }
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
        <GriEditForm
          initialData={companyData}
          griCategories={griCategories}
          griGroups={griGroups}
          onChange={setCompanyData}
        />
      )}
    </DashboardShell>
  );
}
