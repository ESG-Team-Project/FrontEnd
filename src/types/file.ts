/**
 * 파일 관련 타입 정의
 */

/**
 * 파일 업로드 API 응답 형식
 * 서버에서 파일 업로드 요청 처리 후 반환하는 데이터 구조
 */
export interface FileUploadResponse {
  success: boolean;       // 업로드 성공 여부
  message?: string;       // 성공/실패 메시지
  files?: string[];       // 업로드된 파일 이름 목록
  data?: any;             // 추가 데이터 (파싱된 내용 등)
} 