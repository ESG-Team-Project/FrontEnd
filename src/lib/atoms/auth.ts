import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 사용자 정보 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  phone?: string;
}

// 로그인 상태 타입
export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}

// 초기 상태
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
};

// localStorage에 저장/복원되는 인증 atom
export const authAtom = atomWithStorage<AuthState>('auth', initialState);

// 로그인 상태만 확인하는 파생 atom
export const isLoggedInAtom = atom((get) => get(authAtom).isLoggedIn);

// 사용자 정보만 확인하는 파생 atom
export const userAtom = atom((get) => get(authAtom).user);

// 토큰만 확인하는 파생 atom
export const tokenAtom = atom((get) => get(authAtom).token);

// 로그인 함수
export const login = (
  setAuth: (update: AuthState) => void,
  userData: User,
  token: string
) => {
  // 토큰 저장하기 전 로그
  console.log('[AUTH ATOM] 로그인 시작 - 토큰 저장 예정:', token ? `${token.substring(0, 10)}...` : '없음');
  
  // 인증 상태 업데이트
  const authState: AuthState = {
    isLoggedIn: true,
    user: userData,
    token,
  };
  
  setAuth(authState);
  
  // 저장 확인 로그
  console.log('[AUTH ATOM] 로그인 완료 - 사용자:', userData.name);
  
  // localStorage에 직접 저장 확인 (추가 안전장치)
  if (typeof window !== 'undefined') {
    try {
      const storedAuth = localStorage.getItem('auth');
      console.log('[AUTH ATOM] localStorage 확인:', storedAuth ? '저장됨' : '저장 안됨');
    } catch (e) {
      console.error('[AUTH ATOM] localStorage 접근 오류:', e);
    }
  }
};

// 로그아웃 함수
export const logout = (setAuth: (update: AuthState) => void) => {
  console.log('[AUTH ATOM] 로그아웃 실행');
  setAuth(initialState);
  
  // localStorage에서 제거 확인
  if (typeof window !== 'undefined') {
    try {
      const storedAuth = localStorage.getItem('auth');
      console.log('[AUTH ATOM] 로그아웃 후 localStorage 확인:', storedAuth ? '아직 남아있음' : '제거됨');
    } catch (e) {
      console.error('[AUTH ATOM] localStorage 접근 오류:', e);
    }
  }
}; 