import axiosInstance from '../core/axios';
import type { AxiosResponse } from 'axios';
import type { User } from '@/lib/atoms/auth';

/**
 * 사용자 정보 업데이트 요청 타입
 * 사용자 프로필 정보 수정 시 사용되는 데이터 구조
 */
interface UserUpdateRequest {
  name?: string;      // 사용자 이름 (선택적)
  email?: string;     // 이메일 주소 (선택적)
  phone?: string;     // 전화번호 (선택적)
  password?: string;  // 새 비밀번호 (선택적)
}

/**
 * 현재 로그인한 사용자 정보를 가져오는 함수
 * 
 * 인증된 사용자의 상세 정보(이름, 이메일, 역할 등)를 서버에서 조회합니다.
 * 이 함수를 호출하기 전에 사용자가 인증되어 있어야 합니다.
 * 
 * @returns {Promise<User>} 사용자 정보 객체
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const userInfo = await getCurrentUser();
 *   console.log('사용자 이름:', userInfo.name);
 *   console.log('사용자 이메일:', userInfo.email);
 * } catch (error) {
 *   console.error('사용자 정보 조회 실패:', error);
 *   // 오류 처리 로직 (예: 로그인 페이지로 리디렉션)
 * }
 * ```
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('[API User] 현재 사용자 정보 조회 시도');
    
    const response = await axiosInstance.get('/users/me');
    
    console.log('[API User] 현재 사용자 정보 조회 성공:', response.status);
    
    // API 응답 데이터를 User 타입으로 변환
    const user: User = {
      id: String(response.data.id), // number -> string 변환
      name: response.data.name,
      email: response.data.email,
      role: response.data.role || 'user', // role이 없으면 기본값 'user' 사용
      company: response.data.companyName, // companyName -> company로 매핑
      phone: response.data.phoneNumber // phoneNumber -> phone으로 매핑
    };
    
    return user;
  } catch (error) {
    console.error('[API User] 현재 사용자 정보 조회 오류:', error);
    throw error;
  }
};

/**
 * 사용자 정보 업데이트 함수
 * 
 * 로그인한 사용자의 프로필 정보(이름, 이메일, 전화번호 등)를 수정합니다.
 * 변경하려는 필드만 포함하여 요청할 수 있습니다.
 * 
 * @param {UserUpdateRequest} userData - 업데이트할 사용자 데이터
 * @returns {Promise<User>} 업데이트된 사용자 정보
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const updatedUser = await updateUser({
 *     name: '홍길동',
 *     phone: '010-1234-5678'
 *   });
 *   console.log('업데이트된 사용자:', updatedUser);
 * } catch (error) {
 *   console.error('사용자 정보 업데이트 실패:', error);
 * }
 * ```
 */
export const updateUser = async (userData: UserUpdateRequest): Promise<User> => {
  try {
    console.log('[API User] 사용자 정보 업데이트 시도');
    
    const response: AxiosResponse<User> = await axiosInstance.put<User>('/user/update', userData);
    
    console.log('[API User] 사용자 정보 업데이트 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API User] 사용자 정보 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 사용자 프로필 이미지 업데이트 함수
 * 
 * 사용자의 프로필 이미지를 서버에 업로드하고 이미지 URL을 반환합니다.
 * 이미지는 FormData 형식으로 전송되어야 합니다.
 * 
 * @param {FormData} formData - 업로드할 이미지가 포함된 FormData 객체
 * @returns {Promise<{imageUrl: string}>} 업로드된 이미지의 URL이 포함된 객체
 * 
 * 사용 예시:
 * ```typescript
 * const handleImageUpload = async (file: File) => {
 *   const formData = new FormData();
 *   formData.append('image', file);
 *   
 *   try {
 *     const result = await updateProfileImage(formData);
 *     console.log('업로드된 이미지 URL:', result.imageUrl);
 *   } catch (error) {
 *     console.error('이미지 업로드 실패:', error);
 *   }
 * };
 * ```
 */
export const updateProfileImage = async (formData: FormData): Promise<{imageUrl: string}> => {
  try {
    console.log('[API User] 프로필 이미지 업데이트 시도');
    
    const response: AxiosResponse<{imageUrl: string}> = await axiosInstance.post<{imageUrl: string}>(
      '/user/profile-image', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('[API User] 프로필 이미지 업데이트 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API User] 프로필 이미지 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 사용자 비밀번호 변경 함수
 * 
 * 현재 비밀번호 확인 후 새 비밀번호로 변경합니다.
 * 보안을 위해 현재 비밀번호와 새 비밀번호 모두 필요합니다.
 * 
 * @param {string} currentPassword - 현재 비밀번호 (확인용)
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<{success: boolean, message: string}>} 비밀번호 변경 결과 및 메시지
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const result = await changePassword('현재비밀번호', '새비밀번호');
 *   if (result.success) {
 *     console.log('비밀번호 변경 성공:', result.message);
 *   } else {
 *     console.warn('비밀번호 변경 실패:', result.message);
 *   }
 * } catch (error) {
 *   console.error('비밀번호 변경 오류:', error);
 * }
 * ```
 */
export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<{success: boolean, message: string}> => {
  try {
    console.log('[API User] 비밀번호 변경 시도');
    
    const response: AxiosResponse<{success: boolean, message: string}> = 
      await axiosInstance.post<{success: boolean, message: string}>(
        '/user/change-password', 
        { currentPassword, newPassword }
      );
    
    console.log('[API User] 비밀번호 변경 성공:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API User] 비밀번호 변경 오류:', error);
    throw error;
  }
}; 