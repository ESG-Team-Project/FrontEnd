// 모든 atoms 파일을 여기서 내보냅니다
import { mobileOpenAtom } from './mobile';
import { atom } from 'jotai';

// AUTH 관련 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  company?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}

// AUTH 관련 ATOMS
export const isLoggedInAtom = atom<boolean>(false);
export const userAtom = atom<User | null>(null);
export const authAtom = atom<string | null>(null);

// AUTH 관련 액션
export const login = (user: User, token: string) => {
  localStorage.setItem('token', token);
  return { user, token };
};

export const logout = () => {
  localStorage.removeItem('token');
  return null;
};

// 로그인/로그아웃 액션 atoms
export const loginAtom = atom(
  null,
  (get, set, { user, token }: { user: User; token: string }) => {
    set(isLoggedInAtom, true);
    set(userAtom, user);
    set(authAtom, token);
  }
);

export const logoutAtom = atom(null, (get, set) => {
  set(isLoggedInAtom, false);
  set(userAtom, null);
  set(authAtom, null);
});

// MOBILE 관련 ATOMS
export { mobileOpenAtom }; 