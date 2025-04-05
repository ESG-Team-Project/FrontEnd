'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ChartNoAxesCombined,
  Lightbulb,
  BarChart3,
  Users,
  Building2,
  ChevronsRight,
  Globe,
  HandHeart,
  Scale,
  Award,
  Boxes,
  LineChart,
  ClipboardCheck,
  Lock,
  UserCircle2,
  BuildingIcon,
} from 'lucide-react';
import { useAtom } from 'jotai';
import { isLoggedInAtom } from '@/lib/atoms';
import GriDataPreview from './gri-data-preview';

export default function Page() {
  const [isLoggedIn] = useAtom(isLoggedInAtom);

  return (
    <div className="w-full overflow-hidden">
      {/* 히어로 섹션 */}
      <div className="flex flex-col items-center w-full gap-16 pt-16 pb-16 bg-gradient-to-b from-emerald-100 to-white">
        <div className="flex flex-col max-w-2xl gap-8 px-4 mx-auto text-center">
          <h1 className="text-4xl font-bold md:text-6xl">
            <span className="text-emerald-600">ESG 경영</span>을 위한<br />
            <span>통합 대시보드</span>
          </h1>
          <span className="text-sm md:text-base">
            귀사의 환경, 사회, 지배구조 데이터를 한눈에 파악하고 분석할 수 있는 내부 대시보드입니다.<br />
            다양한 차트 유형과 커스텀 대시보드를 통해 ESG 지표를 시각화하고 관리하세요.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 px-4">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="outline" className="text-white bg-black shadow-md" size="lg">
                <span className="whitespace-nowrap">대시보드로 이동</span>
                <ChartNoAxesCombined className="ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="text-white bg-black shadow-md" size="lg">
                  <span className="whitespace-nowrap">로그인하기</span>
                  <UserCircle2 className="ml-2" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="shadow-md bg-emerald-600 text-white" size="lg">
                  <span className="whitespace-nowrap">회원가입</span>
                  <ChevronsRight className="ml-2" />
                </Button>
              </Link>
            </>
          )}
          <Link href="/dashboard?demo=true">
            <Button variant="outline" className="text-black bg-white shadow-md" size="lg">
              <span className="whitespace-nowrap">데모 보기</span>
              <Lightbulb className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* GRI 데이터 미리보기 컴포넌트 */}
        <GriDataPreview />

        {/* 주요 기능 카드 */}
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 px-4 mx-auto md:grid-cols-3 md:gap-8">
          <div className="flex flex-col items-center p-4 text-center bg-white rounded-lg shadow-md md:p-6">
            <BarChart3 className="w-10 h-10 mb-2 md:w-12 md:h-12 text-emerald-600 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">데이터 시각화</h3>
            <p className="text-sm text-gray-600 md:text-base">
              ESG 지표를 직관적인 차트와 그래프로 한눈에 파악하세요. 막대 차트, 선 차트, 파이 차트 등 다양한 시각화 도구를 제공합니다.
            </p>
          </div>

          <div className="flex flex-col items-center p-4 text-center bg-white rounded-lg shadow-md md:p-6">
            <Users className="w-10 h-10 mb-2 md:w-12 md:h-12 text-emerald-600 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">사용자 관리</h3>
            <p className="text-sm text-gray-600 md:text-base">
              회사 정보와 담당자 정보를 등록하고 관리할 수 있습니다. 회원가입과 로그인 시스템으로 안전하게 데이터를 보호합니다.
            </p>
          </div>

          <div className="flex flex-col items-center p-4 text-center bg-white rounded-lg shadow-md md:p-6">
            <Building2 className="w-10 h-10 mb-2 md:w-12 md:h-12 text-emerald-600 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">기업 가치 향상</h3>
            <p className="text-sm text-gray-600 md:text-base">
              ESG 경영을 통해 기업의 지속가능성과 경쟁력을 강화하세요. 회사 정보와 ESG 데이터를 체계적으로 관리합니다.
            </p>
          </div>
        </div>
      </div>
      
      {/* ESG 설명 섹션 */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">ESG의 세 가지 축</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 mr-4 text-green-600" />
                <h3 className="text-xl font-semibold">환경 (Environment)</h3>
              </div>
              <p className="mb-4 text-gray-700">
                기업 활동이 환경에 미치는 영향을 추적하고 관리합니다. 탄소 배출, 에너지 사용, 폐기물 관리, 용수 사용 등의 지표를 모니터링하세요.
              </p>
              <ul className="pl-5 space-y-2 list-disc text-gray-600">
                <li>온실가스 배출량 추적</li>
                <li>에너지 효율성 분석</li>
                <li>자원 재활용 관리</li>
                <li>환경 규제 준수 현황</li>
              </ul>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="flex items-center mb-4">
                <HandHeart className="w-8 h-8 mr-4 text-blue-600" />
                <h3 className="text-xl font-semibold">사회 (Social)</h3>
              </div>
              <p className="mb-4 text-gray-700">
                기업의 사회적 책임과 임직원, 고객, 지역사회와의 관계를 관리합니다. 다양성, 인권, 노동 관행, 지역사회 기여 등을 평가하세요.
              </p>
              <ul className="pl-5 space-y-2 list-disc text-gray-600">
                <li>다양성 및 포용성 지표</li>
                <li>작업장 안전 모니터링</li>
                <li>공급망 책임 관리</li>
                <li>사회공헌 활동 추적</li>
              </ul>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="flex items-center mb-4">
                <Scale className="w-8 h-8 mr-4 text-purple-600" />
                <h3 className="text-xl font-semibold">지배구조 (Governance)</h3>
              </div>
              <p className="mb-4 text-gray-700">
                기업의 의사결정 구조와 윤리적 경영 관행을 관리합니다. 이사회 구성, 윤리 규범, 투명성, 컴플라이언스 등을 평가하세요.
              </p>
              <ul className="pl-5 space-y-2 list-disc text-gray-600">
                <li>이사회 구성 및 다양성</li>
                <li>윤리 및 반부패 정책</li>
                <li>내부 통제 및 위험 관리</li>
                <li>정보 공개 및 투명성</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 상세 설명 */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">주요 기능</h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <Boxes className="w-12 h-12 p-2 text-white rounded-lg bg-emerald-600" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">대시보드 커스터마이징</h3>
                <p className="text-gray-600">
                  사용자가 직접 대시보드를 구성하고 원하는 차트를 추가하거나 제거할 수 있습니다.
                  중요한 지표를 중심으로 자신만의 대시보드를 구성하세요.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <LineChart className="w-12 h-12 p-2 text-white rounded-lg bg-emerald-600" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">다양한 차트 유형</h3>
                <p className="text-gray-600">
                  막대 차트, 선 차트, 파이 차트, 레이더 차트 등 다양한 차트 유형을 지원합니다.
                  데이터 특성에 맞는 시각화 도구를 선택하세요.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <ClipboardCheck className="w-12 h-12 p-2 text-white rounded-lg bg-emerald-600" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">보고서 생성</h3>
                <p className="text-gray-600">
                  ESG 데이터를 기반으로 보고서를 자동으로 생성할 수 있습니다.
                  주요 지표 요약, 개선점, 목표 달성 현황 등을 포함한 보고서를 작성하세요.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <Lock className="w-12 h-12 p-2 text-white rounded-lg bg-emerald-600" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">대시보드 잠금</h3>
                <p className="text-gray-600">
                  편집 모드를 잠그고 해제할 수 있어 실수로 대시보드가 변경되는 것을 방지합니다.
                  필요할 때만 편집 모드를 활성화하여 대시보드를 관리하세요.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <UserCircle2 className="w-12 h-12 p-2 text-white rounded-lg bg-emerald-600" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">사용자 인증</h3>
                <p className="text-gray-600">
                  안전한 사용자 인증 시스템으로 데이터를 보호합니다. 회원가입, 로그인, 프로필 관리 기능을 제공합니다.
                  개인 정보 보호와 데이터 접근 권한을 관리하세요.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <BuildingIcon className="w-12 h-12 p-2 text-white rounded-lg bg-emerald-600" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">기업 정보 관리</h3>
                <p className="text-gray-600">
                  회사 정보, 대표자 정보, 담당자 정보 등을 등록하고 관리할 수 있습니다.
                  사업자 등록번호, 연락처 등 중요한 기업 정보를 체계적으로 관리하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESG 도입 이점 */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl px-4 mx-auto text-center">
          <h2 className="mb-10 text-3xl font-bold md:text-3xl">ESG 관리 대시보드가 필요한 이유</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 bg-gray-50 rounded-lg">
              <Award className="mx-auto mb-4 text-amber-500 w-14 h-14" />
              <h3 className="mb-3 text-xl font-semibold">투자자 신뢰도 향상</h3>
              <p className="text-gray-600">
                투명한 ESG 정보 공개로 투자자들의 신뢰를 얻고, ESG 중심 투자 유치 기회를 확대할 수 있습니다.
                체계적인 데이터 관리로 투자자와의 소통을 강화하세요.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <ClipboardCheck className="mx-auto mb-4 text-blue-500 w-14 h-14" />
              <h3 className="mb-3 text-xl font-semibold">규제 대응 및 준수</h3>
              <p className="text-gray-600">
                점점 강화되는 ESG 관련 규제와 요구사항을 효과적으로 관리하고 대응할 수 있습니다.
                규제 변화를 모니터링하고 신속하게 조치를 취하세요.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Scale className="mx-auto mb-4 text-red-500 w-14 h-14" />
              <h3 className="mb-3 text-xl font-semibold">리스크 관리 강화</h3>
              <p className="text-gray-600">
                환경, 사회, 지배구조 관련 리스크를 조기에 식별하고 대응할 수 있습니다.
                데이터 기반의 의사결정으로 잠재적 위험을 미리 방지하세요.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Lightbulb className="mx-auto mb-4 text-yellow-500 w-14 h-14" />
              <h3 className="mb-3 text-xl font-semibold">성장 기회 포착</h3>
              <p className="text-gray-600">
                ESG 트렌드를 파악하고 새로운 비즈니스 기회를 창출할 수 있습니다.
                지속가능한 발전을 통해 기업 경쟁력을 강화하고 미래 성장 동력을 확보하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="py-16 text-white bg-emerald-700">
        <div className="max-w-4xl px-4 mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold">지금 바로 ESG 대시보드를 시작하세요</h2>
          <p className="mb-8 text-lg text-emerald-100">
            회원가입 후 귀사의 ESG 경영을 위한 첫 걸음을 시작하세요. 
            직관적인 대시보드로 ESG 데이터를 효과적으로 관리하고 분석할 수 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-100">
                  대시보드로 이동
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-100">
                    회원가입
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-emerald-600 bg-emerald-800">
                    로그인하기
                  </Button>
                </Link>
              </>
            )}
            <Link href="/dashboard?demo=true">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-emerald-600 bg-emerald-800">
                데모 살펴보기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
