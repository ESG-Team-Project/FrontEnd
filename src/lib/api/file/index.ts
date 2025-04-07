import type { FileUploadResponse } from '@/types/file';
import type { AxiosResponse } from 'axios';
import axiosInstance from '../core/axios';

/**
 * Excel 파일 업로드 함수
 *
 * Excel(xlsx, xls) 형식의 데이터 파일을 서버에 업로드합니다.
 * 복잡한 구조의 데이터나 여러 시트가 포함된 데이터에 적합합니다.
 *
 * @param {FormData} formData - 업로드할 파일을 포함한 FormData 객체
 * @returns {Promise<FileUploadResponse>} 업로드 결과 및 파일 정보
 *
 * 사용 예시:
 * ```typescript
 * import { useDropzone } from 'react-dropzone';
 *
 * // React 컴포넌트 내에서
 * const onDrop = useCallback(async (acceptedFiles) => {
 *   const formData = new FormData();
 *   formData.append('file', acceptedFiles[0]);
 *
 *   try {
 *     const result = await uploadExcel(formData);
 *     console.log('Excel 파일 업로드 결과:', result);
 *   } catch (error) {
 *     console.error('업로드 실패:', error);
 *   }
 * }, []);
 *
 * const { getRootProps, getInputProps } = useDropzone({ onDrop });
 * ```
 */
export const uploadExcel = async (formData: FormData): Promise<FileUploadResponse> => {
  try {
    console.log('[API File] Excel 파일 업로드 시도');

    const response: AxiosResponse<FileUploadResponse> =
      await axiosInstance.post<FileUploadResponse>('/data-import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    console.log('[API File] Excel 파일 업로드 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API File] Excel 파일 업로드 오류:', error);
    throw error;
  }
};

/**
 * 업로드된 파일 목록 조회 함수
 *
 * 사용자가 이전에 업로드한 모든 파일 목록을 가져옵니다.
 * 파일 관리, 재사용, 삭제 등의 기능에 활용할 수 있습니다.
 *
 * @returns {Promise<string[]>} 업로드된 파일명 배열
 *
 * 사용 예시:
 * ```typescript
 * useEffect(() => {
 *   const fetchFiles = async () => {
 *     try {
 *       const files = await getUploadedFiles();
 *       setFileList(files);
 *       console.log(`${files.length}개의 파일을 불러왔습니다.`);
 *     } catch (error) {
 *       console.error('파일 목록 조회 실패:', error);
 *     }
 *   };
 *
 *   fetchFiles();
 * }, []);
 * ```
 */
export const getUploadedFiles = async (): Promise<string[]> => {
  try {
    console.log('[API File] 업로드된 파일 목록 조회 시도');

    const response: AxiosResponse<string[]> =
      await axiosInstance.get<string[]>('/data-import/files');

    console.log('[API File] 업로드된 파일 목록 조회 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API File] 업로드된 파일 목록 조회 오류:', error);
    throw error;
  }
};

// default export 추가
const fileAPI = {
  uploadExcel,
  getUploadedFiles,
};

export default fileAPI;
