export interface GRICategory {
  id: string;
  group: string; // GRI 지표의 앞부분 (e.g., 102)
  name: string; // 구분
  description: string; // 지표내용
  isQuantitative?: boolean; // 수치 데이터 여부 (true: 숫자, false/undefined: 텍스트)
  // 수치화 가능 여부를 판단할 근거가 필요합니다.
  // 우선은 모든 항목을 텍스트로 처리하고, 추후 로직을 추가하여 구분할 수 있습니다.
  // isQuantitative?: boolean;
  defaultDataType?: 'text' | 'timeSeries' | 'numeric'; // 기본 데이터 타입 추가
}

// gri-cat.tsv 데이터를 파싱하여 생성
export const griCategories: GRICategory[] = [
  {
    id: '102-1',
    group: '102',
    name: '조직 프로필',
    description: '조직 명칭',
    defaultDataType: 'text',
  },
  {
    id: '102-2',
    group: '102',
    name: '조직 프로필',
    description: '활동 및 대표 브랜드, 제품 및 서비스',
    defaultDataType: 'text',
  },
  {
    id: '102-3',
    group: '102',
    name: '조직 프로필',
    description: '본사의 위치',
    defaultDataType: 'text',
  },
  {
    id: '102-4',
    group: '102',
    name: '조직 프로필',
    description: '사업 지역',
    defaultDataType: 'text',
  },
  {
    id: '102-5',
    group: '102',
    name: '조직 프로필',
    description: '소유 구조 특성 및 법적 형태',
    defaultDataType: 'text',
  },
  {
    id: '102-6',
    group: '102',
    name: '조직 프로필',
    description: '시장 영역(제품과 서비스가 제공되는 위치, 고객 유형 등)',
    defaultDataType: 'text',
  },
  {
    id: '102-7',
    group: '102',
    name: '조직 프로필',
    description: '조직의 규모(임직원 수, 사업장 수, 순 매출 등)',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '102-8',
    group: '102',
    name: '조직 프로필',
    description: '임직원 및 근로자에 대한 정보',
    defaultDataType: 'text',
  },
  {
    id: '102-9',
    group: '102',
    name: '조직 프로필',
    description: '조직의 공급망',
    defaultDataType: 'text',
  },
  {
    id: '102-10',
    group: '102',
    name: '조직 프로필',
    description: '보고기간 동안 발생한 조직 및 공급망의 중대한 변화',
    defaultDataType: 'text',
  },
  {
    id: '102-11',
    group: '102',
    name: '조직 프로필',
    description: '사전예방 원칙 및 접근',
    defaultDataType: 'text',
  },
  {
    id: '102-12',
    group: '102',
    name: '조직 프로필',
    description: '조직이 가입하였거나 지지하는 외부 이니셔티브(사회헌장, 원칙 등)',
    defaultDataType: 'text',
  },
  {
    id: '102-13',
    group: '102',
    name: '조직 프로필',
    description: '협회 맴버십 현황',
    defaultDataType: 'text',
  },
  {
    id: '102-14',
    group: '102',
    name: '전략',
    description: '최고 의사 결정권자 성명서',
    defaultDataType: 'text',
  },
  {
    id: '102-15',
    group: '102',
    name: '전략',
    description: '주요 영향, 위기 그리고 기회',
    defaultDataType: 'text',
  },
  {
    id: '102-16',
    group: '102',
    name: '윤리성 및 청렴성',
    description: '가치, 원칙, 표준, 행동강령',
    defaultDataType: 'text',
  },
  {
    id: '102-17',
    group: '102',
    name: '윤리성 및 청렴성',
    description: '윤리 관리 안내 및 고충처리 메커니즘',
    defaultDataType: 'text',
  },
  {
    id: '102-18',
    group: '102',
    name: '거버넌스',
    description: '지배구조',
    defaultDataType: 'text',
  },
  {
    id: '102-19',
    group: '102',
    name: '거버넌스',
    description: '권한 위임 절차',
    defaultDataType: 'text',
  },
  {
    id: '102-20',
    group: '102',
    name: '거버넌스',
    description: '경제적, 환경적, 사회적 토픽에 대한 임원진 책임',
    defaultDataType: 'text',
  },
  {
    id: '102-21',
    group: '102',
    name: '거버넌스',
    description: '이해관계자와 경제, 환경, 사회적 토픽 협의',
    defaultDataType: 'text',
  },
  {
    id: '102-22',
    group: '102',
    name: '거버넌스',
    description: '최고의사결정기구와 산하 위원회의 구성',
    defaultDataType: 'text',
  },
  {
    id: '102-23',
    group: '102',
    name: '거버넌스',
    description: '최고의사결정기구의 의장',
    defaultDataType: 'text',
  },
  {
    id: '102-24',
    group: '102',
    name: '거버넌스',
    description: '최고의사결정기구 및 산하위원회의 임명과 선정 절차',
    defaultDataType: 'text',
  },
  {
    id: '102-25',
    group: '102',
    name: '거버넌스',
    description: '이해관계 상충',
    defaultDataType: 'text',
  },
  {
    id: '102-26',
    group: '102',
    name: '거버넌스',
    description: '목적, 가치 및 전략 수립에 관한 최고의사결정기구의 역할',
    defaultDataType: 'text',
  },
  {
    id: '102-27',
    group: '102',
    name: '거버넌스',
    description: '최고의사결정기구의 공동지식 강화 및 개발절차',
    defaultDataType: 'text',
  },
  {
    id: '102-28',
    group: '102',
    name: '거버넌스',
    description: '최고의사결정기구의 성과평가에 대한 절차',
    defaultDataType: 'text',
  },
  {
    id: '102-29',
    group: '102',
    name: '거버넌스',
    description: '최고의사결정기구의 경제적, 환경적, 사회적 영향 파악과 관리',
    defaultDataType: 'text',
  },
  {
    id: '102-30',
    group: '102',
    name: '거버넌스',
    description: '리스크관리 절차의 효과성',
    defaultDataType: 'text',
  },
  {
    id: '102-31',
    group: '102',
    name: '거버넌스',
    description: '경제적, 환경적, 사회적 토픽에 대한 점검',
    defaultDataType: 'text',
  },
  {
    id: '102-32',
    group: '102',
    name: '거버넌스',
    description: '지속가능성 보고에 대한 최고의사결정기구의 역할',
    defaultDataType: 'text',
  },
  {
    id: '102-33',
    group: '102',
    name: '거버넌스',
    description: '중요 사항을 최고의사결정기구에 보고하는 절차',
    defaultDataType: 'text',
  },
  {
    id: '102-34',
    group: '102',
    name: '거버넌스',
    description: '중요 사항의 특성 및 보고 횟수',
    defaultDataType: 'text',
  },
  {
    id: '102-35',
    group: '102',
    name: '거버넌스',
    description: '보상 정책',
    defaultDataType: 'text',
  },
  {
    id: '102-36',
    group: '102',
    name: '거버넌스',
    description: '보수 결정 절차 및 보수자문위원 관여 여부',
    defaultDataType: 'text',
  },
  {
    id: '102-37',
    group: '102',
    name: '거버넌스',
    description: '보수에 대한 이해관계자의 참여',
    defaultDataType: 'text',
  },
  {
    id: '102-38',
    group: '102',
    name: '거버넌스',
    description: '연찬 총 보상 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '102-39',
    group: '102',
    name: '거버넌스',
    description: '연간 총 보상 인상율',
    defaultDataType: 'numeric',
  },
  {
    id: '102-40',
    group: '102',
    name: '이해관계자 참여',
    description: '조직과 관련 있는 이해관계자 집단 리스트',
    defaultDataType: 'text',
  },
  {
    id: '102-41',
    group: '102',
    name: '이해관계자 참여',
    description: '전체 임직원 중 단체협약이 적용되는 임직원의 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '102-42',
    group: '102',
    name: '이해관계자 참여',
    description: '이해관계자 파악 및 선정',
    defaultDataType: 'text',
  },
  {
    id: '102-43',
    group: '102',
    name: '이해관계자 참여',
    description: '이해관계자 참여 방식',
    defaultDataType: 'text',
  },
  {
    id: '102-44',
    group: '102',
    name: '이해관계자 참여',
    description: '이해관계자 참여를 통해 제기된 핵심 토픽 및 관심사',
    defaultDataType: 'text',
  },
  {
    id: '102-45',
    group: '102',
    name: '보고서 관행',
    description: '조직의 연결 재무제표에 포함된 자회사 및 합작회사 리스트',
    defaultDataType: 'text',
  },
  {
    id: '102-46',
    group: '102',
    name: '보고서 관행',
    description: '보고 내용 및 토픽의 경계 정의',
    defaultDataType: 'text',
  },
  {
    id: '102-47',
    group: '102',
    name: '보고서 관행',
    description: '보고서 내용 결정 과정에서 파악한 모든 중요 토픽 리스트',
    defaultDataType: 'text',
  },
  {
    id: '102-48',
    group: '102',
    name: '보고서 관행',
    description: '이전 보고서에 기록된 정보 수정',
    defaultDataType: 'text',
  },
  {
    id: '102-49',
    group: '102',
    name: '보고서 관행',
    description: '중요 토픽 및 주제범위에 대한 변화',
    defaultDataType: 'text',
  },
  {
    id: '102-50',
    group: '102',
    name: '보고서 관행',
    description: '보고 기간',
    defaultDataType: 'text',
  },
  {
    id: '102-51',
    group: '102',
    name: '보고서 관행',
    description: '가장 최근 보고서 발간 일자',
    defaultDataType: 'text',
  },
  {
    id: '102-52',
    group: '102',
    name: '보고서 관행',
    description: '보고 주기(매년, 격년 등)',
    defaultDataType: 'text',
  },
  {
    id: '102-53',
    group: '102',
    name: '보고서 관행',
    description: '보고서에 대한 문의처',
    defaultDataType: 'text',
  },
  {
    id: '102-54',
    group: '102',
    name: '보고서 관행',
    description: 'GRI Standards에 따른 보고 방식',
    defaultDataType: 'text',
  },
  {
    id: '102-55',
    group: '102',
    name: '보고서 관행',
    description: '적용한 GRI 인덱스',
    defaultDataType: 'text',
  },
  {
    id: '102-56',
    group: '102',
    name: '보고서 관행',
    description: '보고서 외부 검증',
    defaultDataType: 'text',
  },
  {
    id: '103-1',
    group: '103',
    name: '경영 접근법',
    description: '중대 토픽과 그 경계에 대한 설명',
    defaultDataType: 'text',
  },
  {
    id: '103-2',
    group: '103',
    name: '경영 접근법',
    description: '경영 접근 방식의 목적, 토픽 관리 방법',
    defaultDataType: 'text',
  },
  {
    id: '103-3',
    group: '103',
    name: '경영 접근법',
    description: '경영 방식 평가 절차, 결과, 조정사항',
    defaultDataType: 'text',
  },
  {
    id: '201-1',
    group: '201',
    name: '경제성과',
    description: '직접적인 경제가치 발생과 분배',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '201-2',
    group: '201',
    name: '경제성과',
    description: '기후변화가 조직의 활동에 미치는 재무적 영향 및 기타 위험과 기회',
    defaultDataType: 'text',
  },
  {
    id: '201-3',
    group: '201',
    name: '경제성과',
    description: '조직의 확정급여형 연금제도 채무 충당',
    defaultDataType: 'text',
  },
  {
    id: '201-4',
    group: '201',
    name: '경제성과',
    description: '국가별 정부의 재정지원 금액',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '202-1',
    group: '202',
    name: '시장지위',
    description:
      '주요 사업장이 위치한 지역의 최저 임금과 비교한 성별 기본초임 임금기준, 최저임금 보상평가 방안 등 공개',
    defaultDataType: 'numeric',
  },
  {
    id: '202-2',
    group: '202',
    name: '시장지위',
    description: '주요 사업장의 현지에서 고용된 고위 경영진 및 정의',
    defaultDataType: 'text',
  },
  {
    id: '203-1',
    group: '203',
    name: '간접 경제효과',
    description:
      '"사회기반시설 투자와 지원 서비스의 개발 및 영향\n(지역사회 긍정적, 부정적 영향 평가, 기부 등)"',
    defaultDataType: 'text',
  },
  {
    id: '203-2',
    group: '203',
    name: '간접 경제효과',
    description: '"영향 규모 등 중요한 간접 경제효과 영향의 예시\n(긍정적, 부정적 영향 포함)"',
    defaultDataType: 'text',
  },
  {
    id: '204-1',
    group: '204',
    name: '조달 관행',
    description: '주요 사업장에서 현지 공급업체에 지급하는 구매 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '205-1',
    group: '205',
    name: '반부패',
    description: '부패 위험을 평가한 사업장의 수 및 비율과 파악된 중요한 위험',
    defaultDataType: 'numeric',
  },
  {
    id: '205-2',
    group: '205',
    name: '반부패',
    description: '반부패 정책 및 절차에 관한 공지와 관련 교육 현황',
    defaultDataType: 'text',
  },
  {
    id: '205-3',
    group: '205',
    name: '반부패',
    description: '확인된 부패 사례와 이에 대한 조치',
    defaultDataType: 'text',
  },
  {
    id: '206-1',
    group: '206',
    name: '반경쟁적 행위',
    description: '경쟁저해행위, 독과점 등 불공정한 거래행위에 대한 법적 조치의 수와 그 결과',
    defaultDataType: 'numeric',
  },
  {
    id: '207-1',
    group: '207',
    name: '세금',
    description: '세금 관리에 대한 접근법',
    defaultDataType: 'text',
  },
  {
    id: '207-2',
    group: '207',
    name: '세금',
    description: '세금 관련 거버넌스, 통제 및 리스크 관리',
    defaultDataType: 'text',
  },
  {
    id: '207-3',
    group: '207',
    name: '세금',
    description: '세금 관련 이해관계자 소통 및 고충 처리 절차',
    defaultDataType: 'text',
  },
  {
    id: '207-4',
    group: '207',
    name: '세금',
    description: '국가별 세무 내역 공시(연결재무제표가 포괄하는 세무 당국)',
    defaultDataType: 'text',
  },
  {
    id: '301-1',
    group: '301',
    name: '원재료',
    description: '사용된 원료의 중량과 부피',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '301-2',
    group: '301',
    name: '원재료',
    description: '재활용 투입재 사용',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '301-3',
    group: '301',
    name: '원재료',
    description: '판매된 제품 및 그 포장재의 재생 비율',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '302-1',
    group: '302',
    name: '에너지',
    description: '조직 내 에너지 소비',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '302-2',
    group: '302',
    name: '에너지',
    description: '조직 외부 에너지 소비',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '302-3',
    group: '302',
    name: '에너지',
    description: '에너지 집약도',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '302-4',
    group: '302',
    name: '에너지',
    description: '에너지 사용량 절감',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '302-5',
    group: '302',
    name: '에너지',
    description: '제품 및 서비스의 에너지 요구량 감축',
    defaultDataType: 'text',
  },
  {
    id: '303-1',
    group: '303',
    name: '용수',
    description: '공유 자원으로서의 용수 활용',
    defaultDataType: 'text',
  },
  {
    id: '303-2',
    group: '303',
    name: '용수',
    description: '방류수 관련 영향 관리',
    defaultDataType: 'text',
  },
  {
    id: '303-3',
    group: '303',
    name: '용수',
    description: '용수 취수량',
    defaultDataType: 'timeSeries',
  },
  {
    id: '303-4',
    group: '303',
    name: '용수',
    description: '용수 방류량',
    defaultDataType: 'timeSeries',
  },
  {
    id: '303-5',
    group: '303',
    name: '용수',
    description: '용수 사용량',
    defaultDataType: 'timeSeries',
  },
  {
    id: '304-1',
    group: '304',
    name: '생물다양성',
    description: '생태계 보호지역/주변지역에 소유, 임대, 관리하는 사업장',
    defaultDataType: 'text',
  },
  {
    id: '304-2',
    group: '304',
    name: '생물다양성',
    description: '생태계 보호지역/주변지역에 사업활동, 제품, 서비스 등으로 인한 영향',
    defaultDataType: 'text',
  },
  {
    id: '304-3',
    group: '304',
    name: '생물다양성',
    description: '서식지 보호 또는 복구',
    defaultDataType: 'text',
  },
  {
    id: '305-1',
    group: '305',
    name: '배출',
    description: '직접 온실가스 배출량(Scope1)',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '305-2',
    group: '305',
    name: '배출',
    description: '간접 온실가스 배출량(Scope2)',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '305-3',
    group: '305',
    name: '배출',
    description: '기타 간접 온실가스 배출량(Scope3)',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '305-4',
    group: '305',
    name: '배출',
    description: '온실가스 배출 집약도',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '305-5',
    group: '305',
    name: '배출',
    description: '온실가스 배출 감축',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '305-6',
    group: '305',
    name: '배출',
    description: '오존파괴물질 배출',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '306-1',
    group: '306',
    name: '폐수 및 폐기물',
    description: '폐기물 발생 및 폐기물 관련 주요 영향',
    defaultDataType: 'text',
  },
  {
    id: '306-2',
    group: '306',
    name: '폐수 및 폐기물',
    description: '폐기물 관련 주요 영향 관리',
    defaultDataType: 'text',
  },
  {
    id: '306-3',
    group: '306',
    name: '폐수 및 폐기물',
    description: '폐기물 발생량 및 종류',
    defaultDataType: 'timeSeries',
  },
  {
    id: '306-4',
    group: '306',
    name: '폐수 및 폐기물',
    description: '폐기물 재활용',
    defaultDataType: 'timeSeries',
  },
  {
    id: '306-5',
    group: '306',
    name: '폐수 및 폐기물',
    description: '폐기물 매립',
    defaultDataType: 'timeSeries',
  },
  {
    id: '307-1',
    group: '307',
    name: '컴플라이언스',
    description: '환경법 및 규정 위반으로 부과된 중요한 벌금의 액수 및 비금전적 제재조치의 수',
    defaultDataType: 'numeric',
  },
  {
    id: '308-1',
    group: '308',
    name: '공급업체 환경 평가',
    description: '환경 기준 심사를 거친 신규 공급업체',
    defaultDataType: 'numeric',
  },
  {
    id: '308-2',
    group: '308',
    name: '공급업체 환경 평가',
    description: '공급망 내 실질적 또는 잠재적인 중대한 부정적 환경영향 및 이에 대한 조치',
    defaultDataType: 'text',
  },
  {
    id: '401-1',
    group: '401',
    name: '고용',
    description: '신규채용, 퇴직자 수 및 비율',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '401-2',
    group: '401',
    name: '고용',
    description: '상근직에게만 제공하는 복리후생',
    defaultDataType: 'text',
  },
  { id: '401-3', group: '401', name: '고용', description: '육아휴직', defaultDataType: 'text' },
  {
    id: '402-1',
    group: '402',
    name: '노사관계',
    description: '경영상 변동에 관한 최소 통지기간',
    defaultDataType: 'text',
  },
  {
    id: '403-1',
    group: '403',
    name: '산업안전보건',
    description: '산업안전보건시스템',
    defaultDataType: 'text',
  },
  {
    id: '403-2',
    group: '403',
    name: '산업안전보건',
    description: '위험 식별, 리스크 평가, 사고 조사',
    defaultDataType: 'text',
  },
  {
    id: '403-3',
    group: '403',
    name: '산업안전보건',
    description: '산업 보건 지원 프로그램',
    defaultDataType: 'text',
  },
  {
    id: '403-4',
    group: '403',
    name: '산업안전보건',
    description: '산업안전보건에 대한 근로자 참여 및 커뮤니케이션',
    defaultDataType: 'text',
  },
  {
    id: '403-5',
    group: '403',
    name: '산업안전보건',
    description: '직업 건강 및 안전에 대한 근로자 교육',
    defaultDataType: 'text',
  },
  {
    id: '403-6',
    group: '403',
    name: '산업안전보건',
    description: '근로자 건강 증진을 위한 프로그램 설명',
    defaultDataType: 'text',
  },
  {
    id: '403-7',
    group: '403',
    name: '산업안전보건',
    description:
      '사업 관계로 인해 직접적인 영향을 미치는 산업보건 및 안전 영향에 대한 예방 및 완화',
    defaultDataType: 'text',
  },
  {
    id: '403-8',
    group: '403',
    name: '산업안전보건',
    description: '산업안전보건 관리시스템의 적용을 받는 근로자',
    defaultDataType: 'numeric',
  },
  {
    id: '403-9',
    group: '403',
    name: '산업안전보건',
    description: '업무 관련 상해',
    defaultDataType: 'numeric',
  },
  {
    id: '403-10',
    group: '403',
    name: '산업안전보건',
    description: '업무 관련 질병',
    defaultDataType: 'numeric',
  },
  {
    id: '404-1',
    group: '404',
    name: '훈련 및 교육',
    description: '임직원 1인당 평균 교육 시간',
    isQuantitative: true,
    defaultDataType: 'timeSeries',
  },
  {
    id: '404-2',
    group: '404',
    name: '훈련 및 교육',
    description: '임직원 역량 강화 및 전환 지원을 위한 프로그램',
    defaultDataType: 'text',
  },
  {
    id: '404-3',
    group: '404',
    name: '훈련 및 교육',
    description: '업무성과 및 경력개발에 대한 정기적인 검토를 받은 근로자 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '405-1',
    group: '405',
    name: '다양성과 기회균등',
    description: '거버넌스 조직 및 임직원 내 다양성',
    defaultDataType: 'text',
  },
  {
    id: '405-2',
    group: '405',
    name: '다양성과 기회균등',
    description: '남성 대비 여성의 기본급 및 보수 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '406-1',
    group: '406',
    name: '차별금지',
    description: '차별 사건 및 이에 대한 시정조치',
    defaultDataType: 'text',
  },
  {
    id: '407-1',
    group: '407',
    name: '결사 및 단체교섭의 자유',
    description: '결사 및 단체교섭의 자유 침해 위험이 있는 사업장 및 공급업체',
    defaultDataType: 'text',
  },
  {
    id: '408-1',
    group: '408',
    name: '아동노동',
    description: '아동 노동 발생 위험이 높은 사업장 및 협력회사',
    defaultDataType: 'text',
  },
  {
    id: '409-1',
    group: '409',
    name: '강제노동',
    description: '강제 노동 발생 위험이 높은 사업장 및 협력회사',
    defaultDataType: 'text',
  },
  {
    id: '410-1',
    group: '410',
    name: '보안관행',
    description: '인권 정책 및 절차에 관한 훈련을 받은 보안요원',
    defaultDataType: 'numeric',
  },
  {
    id: '411-1',
    group: '411',
    name: '원주민 권리',
    description: '원주민 권리 침해 사건의 수',
    defaultDataType: 'numeric',
  },
  {
    id: '412-1',
    group: '412',
    name: '인권평가',
    description: '인권검토 또는 인권영향평가 대상인 사업장의 수와 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '412-2',
    group: '412',
    name: '인권평가',
    description: '사업과 관련된 인권 정책 및 절차에 관한 임직원 교육',
    defaultDataType: 'text',
  },
  {
    id: '412-3',
    group: '412',
    name: '인권평가',
    description: '인권 조항 또는 인권 심사 시행을 포함한 주요 투자 협약과 계약',
    defaultDataType: 'text',
  },
  {
    id: '413-1',
    group: '413',
    name: '지역사회',
    description: '지역사회 참여, 영향 평가 그리고 발전프로그램 운영 비율',
    defaultDataType: 'numeric',
  },
  {
    id: '413-2',
    group: '413',
    name: '지역사회',
    description: '지역사회에 중대한 실질적/잠재적인 부정적 영향이 존재하는 사업장',
    defaultDataType: 'text',
  },
  {
    id: '414-1',
    group: '414',
    name: '공급망 관리',
    description: '사회적 영향평가를 통해 스크리닝된 신규 협력회사',
    defaultDataType: 'numeric',
  },
  {
    id: '414-2',
    group: '414',
    name: '공급망 관리',
    description: '공급망 내 주요한 부정적인 사회 영향과 이에 대한 시행 조치',
    defaultDataType: 'text',
  },
  {
    id: '415-1',
    group: '415',
    name: '공공정책',
    description: '국가별, 수령인/수혜자별 기부한 정치자금 총규모',
    defaultDataType: 'numeric',
  },
  {
    id: '416-1',
    group: '416',
    name: '고객 안전보건',
    description: '제품 및 서비스군의 안전보건 영향 평가',
    defaultDataType: 'text',
  },
  {
    id: '416-2',
    group: '416',
    name: '고객 안전보건',
    description: '제품 및 서비스의 안전보건 영향에 관한 규정 위반 사건',
    defaultDataType: 'numeric',
  },
  {
    id: '417-1',
    group: '417',
    name: '마케팅 및 라벨링',
    description: '정보 및 라벨을 위해 필요한 제품/서비스 정보 유형',
    defaultDataType: 'text',
  },
  {
    id: '417-2',
    group: '417',
    name: '마케팅 및 라벨링',
    description: '제품 및 서비스 정보와 라벨링에 관한 법률규정 및 자율규정을 위반한 사건',
    defaultDataType: 'numeric',
  },
  {
    id: '417-3',
    group: '417',
    name: '마케팅 및 라벨링',
    description: '마케팅 커뮤니케이션과 관련된 규정 위반',
    defaultDataType: 'numeric',
  },
  {
    id: '418-1',
    group: '418',
    name: '고객정보보호',
    description: '고객개인정보보호 위반 및 고객 데이터 분실 관련 제기된 불만 건수',
    defaultDataType: 'numeric',
  },
  {
    id: '419-1',
    group: '419',
    name: '컴플라이언스',
    description: '사회 및 경제 측면의 관련 법규 및 규정 위반에 대한 주요 벌금의 액수',
    defaultDataType: 'numeric',
  },
];

// Helper function to get GRI group name from category ID prefix
export function getGRIGroupName(categoryId: string): string {
  const prefix = categoryId.split('-')[0];
  // You might want to map prefixes to actual group names if needed
  // For now, just returning the prefix
  // Or potentially look up in griGroups data
  // Example: Find group 'GRI 200' if prefix is '201'
  if (prefix.startsWith('2')) return '경제적 성과';
  if (prefix.startsWith('3')) return '환경적 성과';
  if (prefix.startsWith('4')) return '사회적 성과';
  return '일반보고'; // Default or based on 1xx
}
