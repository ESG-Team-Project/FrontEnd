// 모든 atoms 파일을 여기서 내보냅니다
// import { mobileOpenAtom } from './mobile'; // mobile.ts 의존성 제거
import { atom } from 'jotai';

// --- 레이아웃 관련 Atom ---
export const layoutLockedAtom = atom<boolean>(false);
// sidebarOpenAtom을 직접 정의 (mobileOpenAtom 의존성 제거)
export const sidebarOpenAtom = atom<boolean>(false);

// 실제 사이드바 표시 상태를 결정하는 파생 atom
export const displaySidebarAtom = atom(get => {
  const isLocked = get(layoutLockedAtom);
  const isOpen = get(sidebarOpenAtom);
  // 레이아웃이 잠겨있지 않고, 사이드바가 열려 있어야 표시
  return !isLocked && isOpen;
});
// --- End of 레이아웃 관련 Atom ---

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
export const loginAtom = atom(null, (get, set, { user, token }: { user: User; token: string }) => {
  set(isLoggedInAtom, true);
  set(userAtom, user);
  set(authAtom, token);
});

export const logoutAtom = atom(null, (get, set) => {
  set(isLoggedInAtom, false);
  set(userAtom, null);
  set(authAtom, null);
});

// MOBILE 관련 ATOMS (제거됨)
// export { mobileOpenAtom };
