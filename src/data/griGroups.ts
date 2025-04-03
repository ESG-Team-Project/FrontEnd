// src/data/griGroups.ts
export interface GRIGroup {
  id: string;
  name: string;
  type: string;
}

export const griGroups: GRIGroup[] = [
  { id: 'GRI 100', name: '일반보고', type: '공통주제(Universal Standards)' },
  { id: 'GRI 200', name: '경제적 성과', type: '특정주제(Topic-specific Standards)' },
  { id: 'GRI 300', name: '환경적 성과', type: '특정주제(Topic-specific Standards)' },
  { id: 'GRI 400', name: '사회적 성과', type: '특정주제(Topic-specific Standards)' },
]; 