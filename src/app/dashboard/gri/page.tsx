'use client';

import { useState, useEffect } from 'react';
import GriEditForm from '@/components/gri-edit-form';
import { griCategories } from '@/data/griCategories';
import { griGroups } from '@/data/griGroups';
import { CompanyGRIData } from '@/types/companyGriData';
import DashboardShell from '@/components/dashboard-shell';
import { useDashboard } from '@/contexts/dashboard-context';
import { CustomButton } from '@/components/ui/custom-button';
import { getCompanyGriData, saveCompanyGriData } from '@/services/api/gri-service';

export default function DashboardGriEditPage() {
  const { companyId } = useDashboard();
  const [companyData, setCompanyData] = useState<CompanyGRIData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 페이지 특정 로딩 상태 (컨텍스트의 로딩 상태와 별개)
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // 데이터 로딩 함수
  const loadData = async () => {
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
  };

  // 데이터 저장 함수
  const saveData = async () => {
    if (!companyData) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);
      const success = await saveCompanyGriData(companyData);

      if (success) {
        setSaveMessage('변경사항이 성공적으로 저장되었습니다.');
        // 3초 후 메시지 제거
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Error saving GRI data:', err);
      setSaveMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // companyId가 변경될 때 데이터 로드
  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  return (
    <DashboardShell
      pageTitle="GRI 데이터 편집"
      manualStateHandling={true}
      isLoading={isLoadingData}
      error={dataError}
      onRetry={loadData}
      rightMenuItems={
        <div className="flex items-center space-x-2">
          {saveMessage && (
            <span
              className={`text-xs md:text-sm ${saveMessage.includes('성공') ? 'text-green-600' : 'text-red-600'}`}
            >
              {saveMessage}
            </span>
          )}
          <CustomButton
            variant="outline"
            className="bg-white text-xs md:text-sm px-2 md:px-4 h-8 md:h-9"
            onClick={saveData}
            disabled={isSaving || !companyData}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </CustomButton>
        </div>
      }
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
