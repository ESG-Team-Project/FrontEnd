import { CompanyGRICategoryValue, CompanyGRIData } from '@/types/companyGriData';
import { 
  getCompanyGriDataFormatted, 
  saveSingleGriCategory 
} from '.';

// 로컬 스토리지 키
const STORAGE_KEYS = {
  GRI_DATA: 'kpmg_gri_data',
  PENDING_CHANGES: 'kpmg_gri_pending_changes',
  LAST_SYNC: 'kpmg_gri_last_sync'
};

// 로컬 스토리지 유틸리티 함수
const storage = {
  set: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`로컬 스토리지 저장 오류 (${key}):`, error);
    }
  },
  
  get: <T>(key: string): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`로컬 스토리지 조회 오류 (${key}):`, error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`로컬 스토리지 삭제 오류 (${key}):`, error);
    }
  }
};

// 보류 중인 변경사항 인터페이스
interface PendingChange {
  categoryId: string;
  value: CompanyGRICategoryValue;
  timestamp: number;
  retryCount: number;
}

// 향상된 GRI 데이터 서비스
export const enhancedGriService = {
  /**
   * 서버와 로컬 스토리지에서 GRI 데이터를 가져옵니다.
   * 서버 통신에 실패한 경우 로컬 캐시를 사용합니다.
   */
  getData: async (): Promise<CompanyGRIData> => {
    try {
      // 서버에서 데이터 가져오기 시도
      const serverData = await getCompanyGriDataFormatted();
      
      // 성공 시 로컬 스토리지 업데이트
      storage.set(STORAGE_KEYS.GRI_DATA, serverData);
      storage.set(STORAGE_KEYS.LAST_SYNC, Date.now());
      
      // 보류 중인 변경사항 적용
      const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
      if (pendingChanges.length > 0) {
        console.log(`보류 중인 ${pendingChanges.length}개 변경사항 적용 중...`);
        const mergedData = enhancedGriService.applyPendingChanges(serverData, pendingChanges);
        return mergedData;
      }
      
      return serverData;
    } catch (error) {
      console.error('서버에서 GRI 데이터를 가져오는 중 오류 발생:', error);
      
      // 서버 통신 실패 시 로컬 캐시 사용
      const cachedData: CompanyGRIData | null = storage.get(STORAGE_KEYS.GRI_DATA);
      if (cachedData) {
        console.log('로컬 캐시에서 GRI 데이터 사용');
        
        // 보류 중인 변경사항 적용
        const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
        if (pendingChanges.length > 0) {
          return enhancedGriService.applyPendingChanges(cachedData, pendingChanges);
        }
        
        return cachedData;
      }
      
      throw new Error('GRI 데이터를 가져올 수 없습니다. 네트워크 연결을 확인하세요.');
    }
  },
  
  /**
   * 특정 카테고리의 GRI 데이터를 저장합니다.
   * 서버 통신 실패 시 로컬에 변경사항을 보관하고 나중에 동기화합니다.
   */
  saveCategory: async (
    categoryId: string, 
    value: CompanyGRICategoryValue,
    localCallback?: (data: CompanyGRIData) => void
  ): Promise<{ success: boolean; message: string; data?: CompanyGRIData }> => {
    try {
      // 로컬 데이터 즉시 업데이트 (낙관적 UI 업데이트)
      const cachedData: CompanyGRIData | null = storage.get(STORAGE_KEYS.GRI_DATA);
      
      if (cachedData) {
        const updatedData = {
          ...cachedData,
          griValues: {
            ...cachedData.griValues,
            [categoryId]: value
          }
        };
        
        // 로컬 스토리지 업데이트
        storage.set(STORAGE_KEYS.GRI_DATA, updatedData);
        
        // 콜백 호출 (UI 즉시 업데이트)
        if (localCallback) {
          localCallback(updatedData);
        }
      }
      
      // 서버에 저장 시도
      const serverSuccess = await saveSingleGriCategory(categoryId, value);
      
      if (serverSuccess) {
        // 서버 저장 성공 시 보류 중인 변경사항에서 제거
        enhancedGriService.removePendingChange(categoryId);
        
        // 서버에서 최신 데이터 가져와서 로컬 스토리지 업데이트
        try {
          const freshData = await getCompanyGriDataFormatted();
          storage.set(STORAGE_KEYS.GRI_DATA, freshData);
          storage.set(STORAGE_KEYS.LAST_SYNC, Date.now());
          
          // 서버 데이터와 로컬 데이터 일관성 검사
          const isConsistent = enhancedGriService.verifyDataConsistency(freshData, categoryId, value);
          
          if (!isConsistent) {
            console.warn(`데이터 일관성 문제: 카테고리 ${categoryId}`);
            // 일관성 문제 시 로컬에 보류 중인 변경사항 추가 (다음 동기화 시 재시도)
            enhancedGriService.addPendingChange(categoryId, value);
            
            return {
              success: true,
              message: '데이터가 저장되었으나 서버와 일부 불일치가 감지되었습니다.',
              data: freshData
            };
          }
          
          return {
            success: true,
            message: '데이터가 성공적으로 저장되었습니다.',
            data: freshData
          };
        } catch (fetchError) {
          console.error('저장 후 최신 데이터 가져오기 실패:', fetchError);
          // 서버에서 최신 데이터를 가져오는 데 실패하더라도 저장은 성공으로 간주
          return {
            success: true,
            message: '데이터가 저장되었으나 최신 상태를 가져오지 못했습니다.',
            data: cachedData || undefined
          };
        }
      } else {
        // 서버 저장 실패 시 로컬에 보류 중인 변경사항 추가
        enhancedGriService.addPendingChange(categoryId, value);
        
        return {
          success: false,
          message: '서버에 데이터 저장 실패. 변경사항은 로컬에 저장되었습니다.',
          data: cachedData || undefined
        };
      }
    } catch (error) {
      console.error(`카테고리 ${categoryId} 저장 중 오류 발생:`, error);
      
      // 오류 시 로컬에 보류 중인 변경사항 추가
      enhancedGriService.addPendingChange(categoryId, value);
      
      return {
        success: false,
        message: '저장 중 오류가 발생했습니다. 변경사항은 로컬에 저장되었습니다.',
        data: storage.get(STORAGE_KEYS.GRI_DATA)
      };
    }
  },
  
  /**
   * 보류 중인 변경사항을 서버와 동기화합니다.
   */
  syncPendingChanges: async (): Promise<{ 
    success: boolean; 
    synced: number; 
    failed: number; 
    remaining: number 
  }> => {
    const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
    
    if (pendingChanges.length === 0) {
      return { success: true, synced: 0, failed: 0, remaining: 0 };
    }
    
    console.log(`${pendingChanges.length}개의 보류 중인 변경사항 동기화 시도 중...`);
    
    let synced = 0;
    let failed = 0;
    
    // 각 변경사항을 서버에 저장 시도
    for (const change of pendingChanges) {
      try {
        // 최대 재시도 횟수 (5회) 초과 시 건너뛰기
        if (change.retryCount >= 5) {
          console.warn(`카테고리 ${change.categoryId} 변경사항 최대 재시도 횟수 초과`);
          failed++;
          continue;
        }
        
        const success = await saveSingleGriCategory(change.categoryId, change.value);
        
        if (success) {
          // 성공 시 보류 중인 변경사항에서 제거
          enhancedGriService.removePendingChange(change.categoryId);
          synced++;
        } else {
          // 실패 시 재시도 횟수 증가
          enhancedGriService.incrementRetryCount(change.categoryId);
          failed++;
        }
      } catch (error) {
        console.error(`카테고리 ${change.categoryId} 동기화 중 오류 발생:`, error);
        // 오류 시 재시도 횟수 증가
        enhancedGriService.incrementRetryCount(change.categoryId);
        failed++;
      }
    }
    
    // 남은 변경사항 확인
    const remainingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
    
    return {
      success: failed === 0,
      synced,
      failed,
      remaining: remainingChanges.length
    };
  },
  
  /**
   * 보류 중인 변경사항을 추가합니다.
   */
  addPendingChange: (categoryId: string, value: CompanyGRICategoryValue): void => {
    const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
    
    // 이미 같은 카테고리에 대한 변경사항이 있는지 확인
    const existingIndex = pendingChanges.findIndex(change => change.categoryId === categoryId);
    
    if (existingIndex !== -1) {
      // 기존 변경사항 업데이트
      pendingChanges[existingIndex] = {
        categoryId,
        value,
        timestamp: Date.now(),
        retryCount: pendingChanges[existingIndex].retryCount
      };
    } else {
      // 새 변경사항 추가
      pendingChanges.push({
        categoryId,
        value,
        timestamp: Date.now(),
        retryCount: 0
      });
    }
    
    // 로컬 스토리지 업데이트
    storage.set(STORAGE_KEYS.PENDING_CHANGES, pendingChanges);
  },
  
  /**
   * 보류 중인 변경사항을 제거합니다.
   */
  removePendingChange: (categoryId: string): void => {
    const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
    
    const filteredChanges = pendingChanges.filter(change => change.categoryId !== categoryId);
    
    // 로컬 스토리지 업데이트
    storage.set(STORAGE_KEYS.PENDING_CHANGES, filteredChanges);
  },
  
  /**
   * 재시도 횟수를 증가시킵니다.
   */
  incrementRetryCount: (categoryId: string): void => {
    const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
    
    const updatedChanges = pendingChanges.map(change => {
      if (change.categoryId === categoryId) {
        return {
          ...change,
          retryCount: change.retryCount + 1
        };
      }
      return change;
    });
    
    // 로컬 스토리지 업데이트
    storage.set(STORAGE_KEYS.PENDING_CHANGES, updatedChanges);
  },
  
  /**
   * 보류 중인 변경사항을 GRI 데이터에 적용합니다.
   */
  applyPendingChanges: (data: CompanyGRIData, pendingChanges: PendingChange[]): CompanyGRIData => {
    const updatedData = { ...data };
    
    pendingChanges.forEach(change => {
      updatedData.griValues = {
        ...updatedData.griValues,
        [change.categoryId]: change.value
      };
    });
    
    return updatedData;
  },
  
  /**
   * 서버 데이터와 로컬 데이터의 일관성을 검사합니다.
   */
  verifyDataConsistency: (
    serverData: CompanyGRIData, 
    categoryId: string, 
    localValue: CompanyGRICategoryValue
  ): boolean => {
    const serverValue = serverData.griValues[categoryId];
    
    if (!serverValue) {
      return false;
    }
    
    // 데이터 타입에 따른 비교
    if (localValue.dataType === 'text') {
      return serverValue.textValue === localValue.textValue;
    } else if (localValue.dataType === 'numeric') {
      return serverValue.numericValue === localValue.numericValue;
    } else if (localValue.dataType === 'timeSeries') {
      // 시계열 데이터는 길이와 마지막 항목만 간단히 비교
      const localTimeSeries = localValue.timeSeriesData || [];
      const serverTimeSeries = serverValue.timeSeriesData || [];
      
      if (localTimeSeries.length !== serverTimeSeries.length) {
        return false;
      }
      
      if (localTimeSeries.length === 0) {
        return true;
      }
      
      const localLastItem = localTimeSeries[localTimeSeries.length - 1];
      const serverLastItem = serverTimeSeries[serverTimeSeries.length - 1];
      
      return (
        localLastItem.year === serverLastItem.year &&
        localLastItem.value === serverLastItem.value
      );
    }
    
    return false;
  },
  
  /**
   * 모든 로컬 캐시를 지웁니다.
   */
  clearCache: (): void => {
    storage.remove(STORAGE_KEYS.GRI_DATA);
    storage.remove(STORAGE_KEYS.PENDING_CHANGES);
    storage.remove(STORAGE_KEYS.LAST_SYNC);
  },
  
  /**
   * 보류 중인 변경사항 수를 확인합니다.
   */
  getPendingChangesCount: (): number => {
    const pendingChanges: PendingChange[] = storage.get(STORAGE_KEYS.PENDING_CHANGES) || [];
    return pendingChanges.length;
  },
  
  /**
   * 마지막 동기화 시간을 가져옵니다.
   */
  getLastSyncTime: (): Date | null => {
    const lastSync = storage.get<number>(STORAGE_KEYS.LAST_SYNC);
    return lastSync ? new Date(lastSync) : null;
  }
};

export default enhancedGriService; 