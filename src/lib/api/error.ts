import { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

/**
 * API 오류 코드 타입
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * API 오류 인터페이스
 */
export interface ApiErrorResponse {
  code: ApiErrorCode | string;
  message: string;
  details?: Record<string, string[]> | string[];
  timestamp?: string;
  path?: string;
}

/**
 * 오류 메시지를 사용자 친화적으로 변환
 * 
 * @param error API 오류 객체
 * @returns 사용자 친화적인 오류 메시지
 */
export const getErrorMessage = (error: unknown): string => {
  // Axios 오류인 경우
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;
    
    // API 응답 오류가 있는 경우
    if (apiError?.message) {
      return apiError.message;
    }
    
    // HTTP 상태 코드에 따른 기본 메시지
    switch (error.response?.status) {
      case 400:
        return '요청이 잘못되었습니다. 입력값을 확인해주세요.';
      case 401:
        return '인증에 실패했습니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        return '요청이 충돌했습니다. 이미 존재하는 데이터일 수 있습니다.';
      case 422:
        return '유효성 검사에 실패했습니다. 입력값을 확인해주세요.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }
  }
  
  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    return error.message;
  }
  
  // 그외 경우
  return String(error) || '알 수 없는 오류가 발생했습니다.';
};

/**
 * API 오류를 처리하는 공통 함수
 * 
 * @param error API 호출 중 발생한 오류
 * @param options 토스트 표시 옵션 (제목, 콜백 등)
 */
export const handleApiError = (
  error: unknown, 
  options?: { 
    title?: string; 
    onError?: (error: unknown) => void;
    showToast?: boolean;
  }
): void => {
  const { title = '오류 발생', onError, showToast = true } = options || {};
  
  // 개발 환경에서 콘솔에 오류 표시
  console.error('[API Error]', error);
  
  // 사용자 친화적인 오류 메시지 생성
  const message = getErrorMessage(error);
  
  // 토스트로 오류 메시지 표시
  if (showToast) {
    toast({
      variant: 'error',
      title: title,
      description: message,
      duration: 5000,
    });
  }
  
  // 추가 오류 처리 콜백 함수 실행
  if (onError) {
    onError(error);
  }
};

/**
 * API 호출 래퍼 함수 (try-catch 로직 간소화)
 * 
 * @param apiCall API 호출 프로미스 함수
 * @param errorOptions 오류 처리 옵션
 * @returns 결과값 또는 undefined (오류 발생 시)
 */
export const callApi = async <T>(
  apiCall: () => Promise<T>,
  errorOptions?: {
    title?: string;
    onError?: (error: unknown) => void;
    showToast?: boolean;
    defaultValue?: T;
  }
): Promise<T | undefined> => {
  try {
    return await apiCall();
  } catch (error) {
    handleApiError(error, errorOptions);
    return errorOptions?.defaultValue;
  }
};

/**
 * 상세 API 오류 로깅 함수
 * 
 * API 오류 발생 시 상세 정보를 콘솔에 기록합니다.
 * 
 * @param error API 오류 객체
 * @param context 오류가 발생한 컨텍스트 설명
 */
export const logApiResponseDetails = (error: any, context = ''): void => {
  console.error(`[API 상세 로그] ${context || '오류'} 발생:`);
  
  if (!error) {
    console.error('  - 오류 객체가 null 또는 undefined입니다.');
    return;
  }
  
  try {
    // Axios 오류인 경우 응답 상세 정보 추출
    if (error.isAxiosError) {
      console.error('  - Axios 오류 발생');
      
      // 요청 정보
      if (error.config) {
        console.error('  - 요청 정보:');
        console.error(`    URL: ${error.config.method?.toUpperCase() || 'UNKNOWN'} ${error.config.url}`);
        console.error(`    헤더: ${JSON.stringify(error.config.headers)}`);
        
        if (error.config.data) {
          try {
            const data = typeof error.config.data === 'string' 
              ? JSON.parse(error.config.data) 
              : error.config.data;
            console.error('    요청 데이터:', data);
          } catch (e) {
            console.error('    요청 데이터 (파싱 불가):', error.config.data);
          }
        }
      }
      
      // 응답 정보
      if (error.response) {
        console.error(`  - 응답 상태: ${error.response.status} ${error.response.statusText}`);
        
        if (error.response.headers) {
          console.error('  - 응답 헤더:', error.response.headers);
        }
        
        if (error.response.data) {
          console.error('  - 응답 데이터:', error.response.data);
          
          // 백엔드의 상세 에러 메시지 확인
          if (typeof error.response.data === 'object' && error.response.data !== null) {
            if (error.response.data.message) {
              console.error(`  - 백엔드 오류 메시지: ${error.response.data.message}`);
            }
            
            if (error.response.data.error) {
              console.error(`  - 백엔드 오류 코드: ${error.response.data.error}`);
            }
            
            // 스프링 부트의 에러 형식
            if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
              console.error('  - 유효성 검사 오류:');
              error.response.data.errors.forEach((err: any, index: number) => {
                console.error(`    ${index + 1}. ${err.field || '필드 없음'}: ${err.defaultMessage || err.message || '메시지 없음'}`);
              });
            }
          }
        }
      } 
      // 응답이 없는 경우 (네트워크 오류 등)
      else if (error.request) {
        console.error('  - 서버 응답 없음 (네트워크 오류 가능성)');
      }
    } 
    // 일반 오류인 경우
    else if (error instanceof Error) {
      console.error(`  - 일반 오류: ${error.name} - ${error.message}`);
      console.error(`  - 스택 트레이스: ${error.stack}`);
    } 
    // 그 외 모든 타입의 오류
    else {
      console.error(`  - 알 수 없는 형식의 오류:`, error);
    }
  } catch (logError) {
    console.error('  - 오류 로깅 중 추가 예외 발생:', logError);
  }
};

/**
 * 오류 처리 함수 모음
 */
export const errorUtils = {
  getErrorMessage,
  handleApiError,
  callApi,
  logApiResponseDetails
};

export default errorUtils; 