import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const esgIndicators = {
  environment: [
    { id: '301-1', label: '사용된 원료의 중량과 부피' },
    { id: '301-2', label: '재활용 투입재 사용' },
    { id: '301-3', label: '판매된 제품 및 그 포장재의 재생 비율' },
    { id: '302-1', label: '조직 내 에너지 소비' },
    { id: '302-2', label: '조직 외부 에너지 소비' },
    { id: '302-3', label: '에너지 집약도' },
    { id: '302-4', label: '에너지 사용량 절감' },
    { id: '302-5', label: '제품 및 서비스의 에너지 요구량 감축' },
    { id: '303-1', label: '공유 자원으로서의 용수 활용' },
    { id: '303-2', label: '방류수 관련 영향 관리' },
    { id: '303-3', label: '용수 취수량' },
    { id: '303-4', label: '용수 방류량' },
    { id: '303-5', label: '용수 사용량' },
    {
      id: '304-1',
      label: '생태계 보호지역/주변지역에 소유, 임대, 관리하는 사업장',
    },
    {
      id: '304-2',
      label: '생태계 보호지역/주변지역에 사업활동, 제품, 서비스 등으로 인한 영향',
    },
    { id: '304-3', label: '서식지 보호 또는 복구' },
    { id: '305-1', label: '직접 온실가스 배출량(Scope1)' },
    { id: '305-2', label: '간접 온실가스 배출량(Scope2)' },
    { id: '305-3', label: '기타 간접 온실가스 배출량(Scope3)' },
    { id: '305-4', label: '온실가스 배출 집약도' },
    { id: '305-5', label: '온실가스 배출 감축' },
    { id: '305-6', label: '오존파괴물질 배출' },
    { id: '306-1', label: '폐기물 발생 및 폐기물 관련 주요 영향' },
    { id: '306-2', label: '폐기물 관련 주요 영향 관리' },
    { id: '306-3', label: '폐기물 발생량 및 종류' },
    { id: '306-4', label: '폐기물 재활용' },
    { id: '306-5', label: '폐기물 매립' },
    {
      id: '307-1',
      label: '환경법 및 규정 위반으로 부과된 중요한 벌금의 액수 및 비금전적 제재조치의 수',
    },
    { id: '308-1', label: '환경 기준 심사를 거친 신규 공급업체' },
    {
      id: '308-2',
      label: '공급망 내 실질적 또는 잠재적인 중대한 부정적 환경영향 및 이에 대한 조치',
    },
  ],
  social: [
    { id: '401-1', label: '신규채용, 퇴직자 수 및 비율' },
    { id: '401-2', label: '상근직에게만 제공하는 복리후생' },
    { id: '401-3', label: '육아휴직' },
    { id: '402-1', label: '경영상 변동에 관한 최소 통지기간' },
    { id: '403-1', label: '산업안전보건시스템' },
    { id: '403-2', label: '위험 식별, 리스크 평가, 사고 조사' },
    { id: '403-3', label: '산업 보건 지원 프로그램' },
    { id: '403-4', label: '산업안전보건에 대한 근로자 참여 및 커뮤니케이션' },
    { id: '403-5', label: '직업 건강 및 안전에 대한 근로자 교육' },
    { id: '403-6', label: '근로자 건강 증진을 위한 프로그램 설명' },
    {
      id: '403-7',
      label: '사업 관계로 인해 직접적인 영향을 미치는 산업보건 및 안전 영향에 대한 예방 및 완화',
    },
    { id: '403-8', label: '산업안전보건 관리시스템의 적용을 받는 근로자' },
    { id: '403-9', label: '업무 관련 상해' },
    { id: '403-10', label: '업무 관련 질병' },
  ],
  governance: [
    { id: '102-1', label: '조직 명칭' },
    { id: '102-2', label: '활동 및 대표 브랜드, 제품 및 서비스' },
    { id: '102-3', label: '본사의 위치' },
    { id: '102-4', label: '사업 지역' },
    { id: '102-5', label: '소유 구조 특성 및 법적 형태' },
    {
      id: '102-6',
      label: '시장 영역(제품과 서비스가 제공되는 위치, 고객 유형 등)',
    },
    { id: '102-7', label: '조직의 규모(임직원 수, 사업장 수, 순 매출 등)' },
    { id: '102-8', label: '임직원 및 근로자에 대한 정보' },
    { id: '102-9', label: '조직의 공급망' },
    {
      id: '102-10',
      label: '보고기간 동안 발생한 조직 및 공급망의 중대한 변화',
    },
    { id: '102-11', label: '사전예방 원칙 및 접근' },
    {
      id: '102-12',
      label: '조직이 가입하였거나 지지하는 외부 이니셔티브(사회헌장, 원칙 등)',
    },
    { id: '102-13', label: '협회 맴버십 현황' },
    { id: '102-14', label: '최고 의사 결정권자 성명서' },
    { id: '102-15', label: '주요 영향, 위기 그리고 기회' },
    { id: '102-16', label: '가치, 원칙, 표준, 행동강령' },
    { id: '102-17', label: '윤리 관리 안내 및 고충처리 메커니즘' },
    { id: '102-18', label: '지배구조' },
    { id: '102-19', label: '권한 위임 절차' },
    { id: '102-20', label: '경제적, 환경적, 사회적 토픽에 대한 임원진 책임' },
    { id: '102-21', label: '이해관계자와 경제, 환경, 사회적 토픽 협의' },
    { id: '102-22', label: '최고의사결정기구와 산하 위원회의 구성' },
    { id: '102-23', label: '최고의사결정기구의 의장' },
    {
      id: '102-24',
      label: '최고의사결정기구 및 산하위원회의 임명과 선정 절차',
    },
    { id: '102-25', label: '이해관계 상충' },
    {
      id: '102-26',
      label: '목적, 가치 및 전략 수립에 관한 최고의사결정기구의 역할',
    },
    { id: '102-27', label: '최고의사결정기구의 공동지식 강화 및 개발절차' },
    { id: '102-28', label: '최고의사결정기구의 성과평가에 대한 절차' },
    {
      id: '102-29',
      label: '최고의사결정기구의 경제적, 환경적, 사회적 영향 파악과 관리',
    },
    { id: '102-30', label: '리스크관리 절차의 효과성' },
    { id: '102-31', label: '경제적, 환경적, 사회적 토픽에 대한 점검' },
    { id: '102-32', label: '지속가능성 보고에 대한 최고의사결정기구의 역할' },
    { id: '102-33', label: '중요 사항을 최고의사결정기구에 보고하는 절차' },
    { id: '102-34', label: '중요 사항의 특성 및 보고 횟수' },
    { id: '102-35', label: '보상 정책' },
    { id: '102-36', label: '보수 결정 절차 및 보수자문위원 관여 여부' },
    { id: '102-37', label: '보수에 대한 이해관계자의 참여' },
    { id: '102-38', label: '연찬 총 보상 비율' },
    { id: '102-39', label: '연간 총 보상 인상율' },
    { id: '102-40', label: '조직과 관련 있는 이해관계자 집단 리스트' },
    { id: '102-41', label: '전체 임직원 중 단체협약이 적용되는 임직원의 비율' },
    { id: '102-42', label: '이해관계자 파악 및 선정' },
    { id: '102-43', label: '이해관계자 참여 방식' },
    {
      id: '102-44',
      label: '이해관계자 참여를 통해 제기된 핵심 토픽 및 관심사',
    },
    {
      id: '102-45',
      label: '조직의 연결 재무제표에 포함된 자회사 및 합작회사 리스트',
    },
    { id: '102-46', label: '보고 내용 및 토픽의 경계 정의' },
    {
      id: '102-47',
      label: '보고서 내용 결정 과정에서 파악한 모든 중요 토픽 리스트',
    },
    { id: '102-48', label: '이전 보고서에 기록된 정보 수정' },
    { id: '102-49', label: '중요 토픽 및 주제범위에 대한 변화' },
    { id: '102-50', label: '보고 기간' },
    { id: '102-51', label: '가장 최근 보고서 발간 일자' },
    { id: '102-52', label: '보고 주기(매년, 격년 등)' },
    { id: '102-53', label: '보고서에 대한 문의처' },
    { id: '102-54', label: 'GRI Standards에 따른 보고 방식' },
    { id: '102-55', label: '적용한 GRI 인덱스' },
    { id: '102-56', label: '보고서 외부 검증' },
    { id: '103-1', label: '중대 토픽과 그 경계에 대한 설명' },
    { id: '103-2', label: '경영 접근 방식의 목적, 토픽 관리 방법' },
    { id: '103-3', label: '경영 방식 평가 절차, 결과, 조정사항' },
  ],
};

type EsgCategory = 'environment' | 'social' | 'governance';
type EsgIndicator = { id: string; label: string };

export function ESGCombobox() {
  const [openCategoryPopover, setOpenCategoryPopover] = React.useState(false);
  const [openIndicatorPopover, setOpenIndicatorPopover] = React.useState(false);
  const [category, setCategory] = React.useState<EsgCategory | ''>('');
  const [indicator, setIndicator] = React.useState<string>('');

  const categoryOptions = [
    { value: 'environment', label: '환경 (Environment)' },
    { value: 'social', label: '사회 (Social)' },
    { value: 'governance', label: '거버넌스 (Governance)' },
  ];

  const indicators: EsgIndicator[] = category ? esgIndicators[category] : [];

  return (
    <div>
      {/* Category Selection */}
      <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCategoryPopover}
            className="w-full max-w-[500px] justify-between bg-white"
            onClick={() => {
              if (category) {
                setCategory(''); // Reset category and indicator
                setIndicator(''); // Reset indicator
                setOpenCategoryPopover(true); // Open the category popover
              }
            }}
          >
            {category
              ? `${categoryOptions.find(item => item.value === category)?.label}`
              : 'ESG 항목 선택'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-[500px] p-0 bg-white">
          <Command>
            <CommandList>
              <CommandGroup>
                {!category ? (
                  categoryOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={value => {
                        setCategory(value as EsgCategory);
                        setIndicator('');
                        setOpenCategoryPopover(false); // Close the category popover
                        setOpenIndicatorPopover(true); // Open the indicator popover
                      }}
                    >
                      {option.label}
                    </CommandItem>
                  ))
                ) : (
                  <ScrollArea className="h-72 w-48 overflow-auto rounded-md border">
                    <div className="p-4">
                      {indicators.map(option => (
                        <CommandItem
                          key={option.id}
                          value={option.id}
                          onSelect={value => {
                            setIndicator(value === indicator ? '' : value);
                            setOpenIndicatorPopover(false); // Close the indicator popover
                          }}
                        >
                          {option.label}
                          <Check
                            className={cn(
                              'ml-auto',
                              indicator === option.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Indicator Selection */}
      {category && (
        <Popover open={openIndicatorPopover} onOpenChange={setOpenIndicatorPopover} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openIndicatorPopover}
              className="w-full max-w-[500px] justify-between bg-white mt-2"
            >
              {indicator ? indicators.find(item => item.label === indicator)?.label : '지표 선택'}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-full  p-0 bg-white">
            <Command>
              <CommandInput placeholder="Search Indicator..." />
              <CommandList>
                {indicators.length === 0 ? (
                  <CommandEmpty>항목을 찾을 수 없습니다.</CommandEmpty>
                ) : (
                  <ScrollArea className="h-48 w-full overflow-auto">
                    <CommandGroup>
                      {indicators.map(option => (
                        <CommandItem
                          key={option.id}
                          value={option.label}
                          onSelect={currentValue => {
                            setIndicator(currentValue === indicator ? '' : currentValue);
                            setOpenIndicatorPopover(false); // Close the popover
                          }}
                        >
                          {option.label}
                          <Check
                            className={cn(
                              'ml-auto',
                              indicator === option.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
