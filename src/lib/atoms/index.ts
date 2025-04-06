// 모든 atoms 파일을 여기서 내보냅니다
import { atom } from 'jotai';

// auth 모듈에서 내보내기
export * from './auth';

// --- 레이아웃 관련 Atom ---
export const layoutLockedAtom = atom<boolean>(false);
// sidebarOpenAtom을 직접 정의 (mobileOpenAtom 의존성 제거)
export const sidebarOpenAtom = atom<boolean>(false);

// 대시보드 컬럼 수 설정 (dashboaord.ts에서 가져옴)
export { dashboardColumnsAtom } from './dashboard';

// 실제 사이드바 표시 상태를 결정하는 파생 atom
export const displaySidebarAtom = atom((get) => {
  const isLocked = get(layoutLockedAtom);
  const isOpen = get(sidebarOpenAtom);
  // 레이아웃이 잠겨있지 않고, 사이드바가 열려 있어야 표시
  return !isLocked && isOpen;
});
// --- End of 레이아웃 관련 Atom ---

// MOBILE 관련 ATOMS (제거됨)
// export { mobileOpenAtom };
