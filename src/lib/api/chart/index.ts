import axiosInstance from '../core/axios';
import type { AxiosResponse } from 'axios';
import type { ChartData } from '@/types/chart';

/**
 * 차트 생성 함수
 * 
 * 새로운 차트를 서버에 저장합니다.
 * 차트 타입, 제목, 데이터셋 등 모든 필수 정보를 포함해야 합니다.
 * 
 * @param {ChartData} chartData - 저장할 차트 데이터 객체
 * @returns {Promise<ChartData>} 생성된 차트 데이터 (서버에서 ID 등이 추가됨)
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const newChart = await createChart({
 *     title: 'CO2 배출량',
 *     type: 'bar',
 *     description: '2023년 분기별 CO2 배출량',
 *     labels: ['1분기', '2분기', '3분기', '4분기'],
 *     datasets: [
 *       {
 *         label: '배출량(톤)',
 *         data: [45, 32, 28, 21]
 *       }
 *     ],
 *     esg: 'E', // Environmental 카테고리
 *     colSpan: 2, // 대시보드에서 차지하는 너비
 *   });
 *   console.log('차트 생성 완료:', newChart.id);
 * } catch (error) {
 *   console.error('차트 생성 실패:', error);
 * }
 * ```
 */
export const createChart = async (chartData: ChartData): Promise<ChartData> => {
  try {
    console.log('[API Chart] 차트 생성 시도:', chartData.title);
    
    const response: AxiosResponse<ChartData> = await axiosInstance.post<ChartData>(
      '/charts', 
      chartData
    );
    
    console.log('[API Chart] 차트 생성 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Chart] 차트 생성 오류:', error);
    throw error;
  }
};

/**
 * 차트 목록 조회 함수
 * 
 * 사용자가 접근 가능한 모든 차트 목록을 가져옵니다.
 * 권한에 따라 조회되는 차트가 다를 수 있습니다.
 * 
 * @returns {Promise<ChartData[]>} 차트 객체 배열
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const charts = await getCharts();
 *   console.log(`총 ${charts.length}개의 차트를 불러왔습니다.`);
 *   
 *   // 특정 ESG 카테고리의 차트만 필터링
 *   const environmentalCharts = charts.filter(chart => chart.esg === 'E');
 * } catch (error) {
 *   console.error('차트 목록 조회 실패:', error);
 * }
 * ```
 */
export const getCharts = async (): Promise<ChartData[]> => {
  try {
    console.log('[API Chart] 차트 목록 조회 시도');
    
    const response: AxiosResponse<ChartData[]> = await axiosInstance.get<ChartData[]>('/charts');
    
    console.log('[API Chart] 차트 목록 조회 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Chart] 차트 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 특정 차트 상세 조회 함수
 * 
 * 차트 ID를 기반으로 특정 차트의 상세 정보를 가져옵니다.
 * 존재하지 않는 차트 ID를 요청하면 오류가 발생합니다.
 * 
 * @param {string} chartId - 조회할 차트의 고유 ID
 * @returns {Promise<ChartData>} 차트 상세 데이터
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const chartId = '1234abcd';
 *   const chartDetail = await getChartById(chartId);
 *   console.log('차트 제목:', chartDetail.title);
 *   console.log('차트 데이터:', chartDetail.datasets);
 * } catch (error) {
 *   console.error('차트 상세 조회 실패:', error);
 *   // 404 오류 처리 로직
 * }
 * ```
 */
export const getChartById = async (chartId: string): Promise<ChartData> => {
  try {
    console.log('[API Chart] 특정 차트 조회 시도:', chartId);
    
    const response: AxiosResponse<ChartData> = await axiosInstance.get<ChartData>(`/charts/${chartId}`);
    
    console.log('[API Chart] 특정 차트 조회 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Chart] 특정 차트 조회 오류:', error);
    throw error;
  }
};

/**
 * 차트 수정 함수
 * 
 * 기존 차트의 일부 또는 전체 정보를 업데이트합니다.
 * 변경하려는 필드만 포함하여 요청할 수 있습니다.
 * 
 * @param {string} chartId - 수정할 차트의 고유 ID
 * @param {Partial<ChartData>} chartData - 수정할 차트 데이터 (일부 필드만 포함 가능)
 * @returns {Promise<ChartData>} 수정된 차트의 전체 데이터
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   // 차트 제목과 설명만 수정
 *   const updatedChart = await updateChart('1234abcd', {
 *     title: '수정된 차트 제목',
 *     description: '수정된 설명'
 *   });
 *   
 *   console.log('차트 수정 완료:', updatedChart);
 * } catch (error) {
 *   console.error('차트 수정 실패:', error);
 * }
 * ```
 */
export const updateChart = async (chartId: string, chartData: Partial<ChartData>): Promise<ChartData> => {
  try {
    console.log('[API Chart] 차트 수정 시도:', chartId);
    
    const response: AxiosResponse<ChartData> = await axiosInstance.put<ChartData>(
      `/charts/${chartId}`, 
      chartData
    );
    
    console.log('[API Chart] 차트 수정 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Chart] 차트 수정 오류:', error);
    throw error;
  }
};

/**
 * 차트 삭제 함수
 * 
 * 특정 차트를 영구적으로 삭제합니다.
 * 이 작업은 되돌릴 수 없으므로 사용자 확인 후 실행해야 합니다.
 * 
 * @param {string} chartId - 삭제할 차트의 고유 ID
 * @returns {Promise<void>} 반환값 없음
 * 
 * 사용 예시:
 * ```typescript
 * const handleDeleteChart = async (chartId: string) => {
 *   // 사용자 확인
 *   if (confirm('이 차트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
 *     try {
 *       await deleteChart(chartId);
 *       console.log('차트가 성공적으로 삭제되었습니다.');
 *       // UI에서 차트 제거 등의 후속 처리
 *     } catch (error) {
 *       console.error('차트 삭제 실패:', error);
 *     }
 *   }
 * };
 * ```
 */
export const deleteChart = async (chartId: string): Promise<void> => {
  try {
    console.log('[API Chart] 차트 삭제 시도:', chartId);
    
    const response: AxiosResponse<void> = await axiosInstance.delete<void>(`/charts/${chartId}`);
    
    console.log('[API Chart] 차트 삭제 성공:', response.status);
  } catch (error) {
    console.error('[API Chart] 차트 삭제 오류:', error);
    throw error;
  }
}; 