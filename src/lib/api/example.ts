import api, { authService } from '.';

// API 사용 예시 코드

/**
 * 사용자 로그인 예시
 */
export const userLogin = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password });
    console.log('로그인 성공:', response);
    return response;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

/**
 * 사용자 로그아웃 예시
 */
export const userLogout = () => {
  authService.logout();
  console.log('로그아웃 성공');
};

/**
 * 사용자 정보 가져오기 예시
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    console.log('사용자 정보:', response.data);
    return response.data;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 게시글 목록 가져오기 예시
 */
export const getPosts = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    console.log('게시글 목록:', response.data);
    return response.data;
  } catch (error) {
    console.error('게시글 목록 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 게시글 작성 예시
 */
export const createPost = async (title: string, content: string) => {
  try {
    const response = await api.post('/posts', { title, content });
    console.log('게시글 작성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('게시글 작성 실패:', error);
    throw error;
  }
};

/**
 * 게시글 수정 예시
 */
export const updatePost = async (id: number, title: string, content: string) => {
  try {
    const response = await api.put(`/posts/${id}`, { title, content });
    console.log('게시글 수정 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('게시글 수정 실패:', error);
    throw error;
  }
};

/**
 * 게시글 삭제 예시
 */
export const deletePost = async (id: number) => {
  try {
    const response = await api.delete(`/posts/${id}`);
    console.log('게시글 삭제 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    throw error;
  }
};
