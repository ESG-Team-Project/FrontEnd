import type { AxiosResponse } from 'axios';
import axiosInstance from '../core/axios';

/**
 * 프레임워크 문서 다운로드
 * 
 * 프레임워크 기본 템플릿 문서를 다운로드합니다.
 * 
 * @param {string} frameworkId - 프레임워크 ID (gri, sasb, tcfd 등)
 * @param {string} format - 문서 형식 (pdf, docx)
 * @returns {Promise<Blob>} 다운로드된 문서 파일 Blob
 */
export const downloadFrameworkDocument = async (
  frameworkId: string, 
  format: 'pdf' | 'docx' = 'pdf'
): Promise<Blob> => {
  try {
    console.log(`[API Documents] ${frameworkId} 문서 다운로드 시도 (${format})`);

    const response: AxiosResponse<Blob> = await axiosInstance.get(
      `/api/documents/${frameworkId}?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    console.log('[API Documents] 문서 다운로드 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Documents] 문서 다운로드 오류:', error);
    throw error;
  }
};

/**
 * 회사별 맞춤형 보고서 다운로드
 * 
 * 회사의 ESG 데이터가 포함된 맞춤형 보고서를 다운로드합니다.
 * 
 * @param {string} frameworkId - 프레임워크 ID (gri, sasb, tcfd 등)
 * @param {string} format - 문서 형식 (pdf, docx)
 * @returns {Promise<Blob>} 다운로드된 보고서 파일 Blob
 */
export const downloadCompanyReport = async (
  frameworkId: string, 
  format: 'pdf' | 'docx' = 'pdf'
): Promise<Blob> => {
  try {
    console.log(`[API Documents] ${frameworkId} 회사 보고서 다운로드 시도 (${format})`);

    const response: AxiosResponse<Blob> = await axiosInstance.get(
      `/api/documents/report/${frameworkId}?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    console.log('[API Documents] 회사 보고서 다운로드 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API Documents] 회사 보고서 다운로드 오류:', error);
    throw error;
  }
};

/**
 * 문서 다운로드 헬퍼 함수
 * 
 * Blob 데이터를 받아 브라우저에서 다운로드를 시작합니다.
 * 
 * @param {Blob} blob - 다운로드할 파일 Blob
 * @param {string} filename - 파일 이름
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * 파일명 추출 함수
 * 
 * Content-Disposition 헤더에서 파일명을 추출합니다.
 * 
 * @param {string} contentDisposition - Content-Disposition 헤더 값
 * @param {string} defaultFilename - 기본 파일명 (헤더에서 파일명을 추출할 수 없는 경우 사용)
 * @returns {string} 추출된 파일명
 */
export const getFilenameFromContentDisposition = (
  contentDisposition: string | null, 
  defaultFilename: string
): string => {
  if (!contentDisposition) return defaultFilename;
  
  try {
    return decodeURIComponent(
      contentDisposition
        .split('filename=')[1]
        .replace(/"/g, '')
        .trim()
    );
  } catch (error) {
    console.warn('파일명 추출 실패, 기본값 사용:', defaultFilename);
    return defaultFilename;
  }
};

// 문서 서비스 객체
const documentsService = {
  downloadFrameworkDocument,
  downloadCompanyReport,
  downloadBlob,
  getFilenameFromContentDisposition
};

export default documentsService; 