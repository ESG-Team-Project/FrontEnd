'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 대시보드 컨텍스트의 타입 정의
interface DashboardContextType {
  companyId: string | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// 기본값 설정
const defaultContext: DashboardContextType = {
  companyId: null,
  loading: true,
  error: null,
  refreshData: async () => {},
  setError: () => {},
  clearError: () => {},
};

// 컨텍스트 생성
const DashboardContext = createContext<DashboardContextType>(defaultContext);

// 현재 사용자의 회사 ID를 가져오는 함수 (실제 구현은 인증 시스템에 따라 달라짐)
async function getCurrentUserCompanyId(): Promise<string | null> {
  // 실제로는 인증 라이브러리나 API 호출로 구현
  console.log("Fetching current user's company ID...");
  return 'company-123'; // 임시 데이터
}

// 컨텍스트 제공자 컴포넌트
export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 새로고침 함수
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await getCurrentUserCompanyId();
      setCompanyId(userId);
    } catch (err) {
      console.error('Error fetching company ID:', err);
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 에러 초기화 함수
  const clearError = () => {
    setError(null);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    refreshData();
  }, []);

  // 컨텍스트 값 제공
  const contextValue: DashboardContextType = {
    companyId,
    loading,
    error,
    refreshData,
    setError,
    clearError,
  };

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
}

// 컨텍스트 사용을 위한 훅
export const useDashboard = () => useContext(DashboardContext);

// 기본 내보내기를 통한 호환성 확보
export default DashboardDataProvider;
