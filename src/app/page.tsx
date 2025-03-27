import { Button } from "@/components/ui/button";
import { ChartNoAxesCombined, Lightbulb, BarChart3, Users, Building2, User, Building } from "lucide-react"

export default function Page() {
  const menuItems = [
    { title: "담당자 정보", url: "/", icon: User },
    { title: "회사 정보", url: "/mypage/company", icon: Building },
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col items-center w-full gap-16 pt-10 pb-10  bg-gradient-to-b from-emerald-100 to-white">
        <div className="flex flex-col max-w-xl gap-8 px-4 mx-auto text-center">
          <h1 className="text-4xl font-bold md:text-6xl">
            <span className="text-emerald-600">
              ESG 경영
            </span>
            을 위한 통합 대시보드
          </h1>
          <span className="text-sm md:text-base">
            귀사의 환경, 사회, 지배구조 데이터를 한눈에 파악하고 분석할 수 있는 내부 대시보드입니다.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 px-4">
          <Button variant="outline" className="text-white bg-black shadow-md" size="lg">
            <span className="whitespace-nowrap">대시보드 시작하기</span>
            <ChartNoAxesCombined className="ml-2" />
          </Button>
          <Button variant="outline" className="text-black bg-white shadow-md" size="lg">
            <span className="whitespace-nowrap">주요기능 살펴보기</span>
            <Lightbulb className="ml-2" />
          </Button>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 px-4 mx-auto md:grid-cols-3 md:gap-8">
          <div className="flex flex-col items-center p-4 text-center bg-white rounded-lg shadow-md md:p-6">
            <BarChart3 className="w-10 h-10 mb-2 md:w-12 md:h-12 text-emerald-600 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">데이터 시각화</h3>
            <p className="text-sm text-gray-600 md:text-base">ESG 지표를 직관적인 차트와 그래프로 한눈에 파악하세요.</p>
          </div>

          <div className="flex flex-col items-center p-4 text-center bg-white rounded-lg shadow-md md:p-6">
            <Users className="w-10 h-10 mb-2 md:w-12 md:h-12 text-emerald-600 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">협력사 관리</h3>
            <p className="text-sm text-gray-600 md:text-base">협력사의 ESG 성과를 추적하고 평가하여 공급망 지속가능성을 높이세요.</p>
          </div>

          <div className="flex flex-col items-center p-4 text-center bg-white rounded-lg shadow-md md:p-6">
            <Building2 className="w-10 h-10 mb-2 md:w-12 md:h-12 text-emerald-600 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">기업 가치 향상</h3>
            <p className="text-sm text-gray-600 md:text-base">ESG 경영을 통해 기업의 지속가능성과 경쟁력을 강화하세요.</p>
          </div>
        </div>

        <div className="w-full max-w-4xl px-4 mx-auto text-center">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl md:mb-6">왜 ESG 대시보드인가?</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <div className="p-3 md:p-4">
              <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">투자자 신뢰도 향상</h3>
              <p className="text-sm text-gray-600 md:text-base">투명한 ESG 정보 공개로 투자자들의 신뢰를 얻을 수 있습니다.</p>
            </div>
            <div className="p-3 md:p-4">
              <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">규제 대응</h3>
              <p className="text-sm text-gray-600 md:text-base">ESG 관련 규제와 요구사항을 효과적으로 관리하고 대응할 수 있습니다.</p>
            </div>
            <div className="p-3 md:p-4">
              <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">리스크 관리</h3>
              <p className="text-sm text-gray-600 md:text-base">ESG 관련 리스크를 조기에 식별하고 대응할 수 있습니다.</p>
            </div>
            <div className="p-3 md:p-4">
              <h3 className="mb-1 text-lg font-semibold md:text-xl md:mb-2">기회 포착</h3>
              <p className="text-sm text-gray-600 md:text-base">ESG 트렌드를 파악하고 새로운 비즈니스 기회를 창출할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
