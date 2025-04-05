import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
// import type { User, AuthState } from './types'; // types.ts 사용 안 함
import { useEffect } from 'react';

// --- 타입 정의 (추가 및 export) ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  phoneNumber?: string; // phone 속성 추가
  companyName?: string; // companyName 속성 추가
  ceoName?: string; // ceoName 속성 추가
  companyCode?: string; // companyCode 속성 추가
  companyPhoneNumber?: string; // companyPhoneNumber 속성 추가
} 

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}
// --- End of 타입 정의 ---

// 초기 상태
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
  isLoading: true,
};

// localStorage에 저장/복원되는 인증 atom
export const authAtom = atomWithStorage<AuthState>('auth', initialState);

// --- 파생 상태 Atom ---
export const isLoggedInAtom = atom(get => get(authAtom).isLoggedIn);
export const userAtom = atom(get => get(authAtom).user);
export const tokenAtom = atom(get => get(authAtom).token);
export const isLoadingAtom = atom(get => get(authAtom).isLoading);

// --- 상태 초기화 완료 Atom ---
export const authInitializedAtom = atom(false);

// --- 액션 Atom (Write-only) ---
export const loginAtom = atom(null, (get, set, { user, token }: { user: User; token: string }) => {
  console.log('[Auth Atom Action] Login executed');
  // 인증 상태 갱신
  set(authAtom, { isLoggedIn: true, user, token, isLoading: false });
  // 초기화 플래그 설정
  if (!get(authInitializedAtom)) {
    set(authInitializedAtom, true);
  }
});

export const logoutAtom = atom(null, (get, set) => {
  console.log('[Auth Atom Action] Logout executed');
  set(authAtom, { isLoggedIn: false, user: null, token: null, isLoading: false });
  if (!get(authInitializedAtom)) {
    set(authInitializedAtom, true);
  }
});

// --- 초기화 훅 ---
export const useInitializeAuth = () => {
  const [isLoading] = useAtom(isLoadingAtom);     // 상태 복원 중 여부
  const [isInitialized, setInitialized] = useAtom (authInitializedAtom);  // 초기화 여부
  const [auth] = useAtom(authAtom);          // 전체 인증 상태
  const [, logout] = useAtom(logoutAtom);     // 로그아웃 액션

  useEffect(() => {
    if (!isLoading && !isInitialized) {
      console.log('[useInitializeAuth] Auth state loaded from storage.', auth);
      if (auth.token && !auth.user && auth.isLoggedIn) {
        console.warn('[useInitializeAuth] Token exists but user missing, forcing logout.');
        logout();
      }
      setInitialized(true);
      console.log('[useInitializeAuth] Auth initialized.');
    }
  }, [isLoading, isInitialized, setInitialized, auth, logout]);
};
