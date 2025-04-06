import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 대시보드 열 개수 설정 (3칸 또는 4칸)
export const dashboardColumnsAtom = atomWithStorage<3 | 4>('dashboard-columns', 4); 