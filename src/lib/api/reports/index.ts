import type { AxiosResponse } from 'axios';
import axiosInstance from '../core/axios';

/**
 * 회사 보고서 생성 API
 * 
 * 회사의 ESG 데이터를 기반으로 보고서를 생성합니다.
 * 
 * @param {string} frameworkId - 프레임워크 ID (gri, sasb, tcfd 등)
 * @param {string} format - 문서 형식 (pdf, docx)
 * @param {Object} options - 보고서 생성 옵션
 * @returns {Promise<{ reportId: string }>} 생성된 보고서 ID
 */
export const generateCompanyReport = async (
  frameworkId: string,
  format: 'pdf' | 'docx' = 'pdf',
  options?: {
    companyId?: string;
    yearStart?: number;
    yearEnd?: number;
  }
): Promise<{ reportId: string }> => {
  try {
    console.log(`[API Reports] ${frameworkId} 보고서 생성 시도 (${format})`);

    const response: AxiosResponse<{ reportId: string }> = await axiosInstance.post(
      `/api/reports/company`,
      {
        frameworkId,
        format,
        ...options
      }
    );

    console.log('[API Reports] 보고서 생성 성공:', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('[API Reports] 보고서 생성 오류:', error);
    throw error;
  }
};

/**
 * 생성된 보고서 상태 조회
 * 
 * 비동기로 생성 중인 보고서의 상태를 확인합니다.
 * 
 * @param {string} reportId - 보고서 ID
 * @returns {Promise<{ status: string, progress?: number, url?: string }>} 보고서 상태 정보
 */
export const getReportStatus = async (
  reportId: string
): Promise<{ status: 'pending' | 'processing' | 'completed' | 'failed', progress?: number, url?: string }> => {
  try {
    console.log(`[API Reports] 보고서 상태 확인: ${reportId}`);

    const response: AxiosResponse<{ status: 'pending' | 'processing' | 'completed' | 'failed', progress?: number, url?: string }> = 
      await axiosInstance.get(`/api/reports/status/${reportId}`);

    console.log('[API Reports] 보고서 상태:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API Reports] 보고서 상태 확인 오류:', error);
    throw error;
  }
};

// 보고서 서비스 객체
const reportsService = {
  generateCompanyReport,
  getReportStatus
};

export default reportsService; 