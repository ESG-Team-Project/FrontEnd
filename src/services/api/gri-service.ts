import { griCategories } from '@/data/griCategories';
import type { CompanyGRICategoryValue, CompanyGRIData } from '@/types/companyGriData';

// 회사의 GRI 데이터를 가져오는 함수
export async function getCompanyGriData(companyId: string): Promise<CompanyGRIData> {
  console.log(`Fetching GRI data for company: ${companyId}`);
  // 실제로는 API 호출로 구현:
  // const response = await fetch(`/api/company/${companyId}/gri`);
  // return await response.json();

  // 임시 데이터 생성
  const initialData: Record<string, CompanyGRICategoryValue> = {};
  
  for (const cat of griCategories) {
    initialData[cat.id] = {
      categoryId: cat.id,
      dataType: cat.defaultDataType as 'timeSeries' | 'text' | 'numeric' || 'text',
      timeSeriesData: cat.defaultDataType === 'timeSeries' ? [] : undefined,
      textValue: cat.defaultDataType === 'text' ? '' : null,
      numericValue: cat.defaultDataType === 'numeric' ? 0 : null
    };
  }

  // API 응답 시뮬레이션 (지연 효과)
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    companyId,
    griValues: initialData,
  };
}

// GRI 데이터 저장하는 함수
export async function saveCompanyGriData(data: CompanyGRIData): Promise<boolean> {
  console.log(`Saving GRI data for company: ${data.companyId}`);

  // 실제로는 API 호출로 구현:
  // const response = await fetch(`/api/company/${data.companyId}/gri`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(data),
  // });
  // return response.ok;

  // 저장 성공 시뮬레이션 (지연 효과)
  await new Promise((resolve) => setTimeout(resolve, 700));

  return true;
}

// 개별 GRI 카테고리 데이터만 저장하는 함수
export async function saveSingleGriCategory(
  companyId: string,
  categoryId: string,
  categoryValue: CompanyGRICategoryValue
): Promise<boolean> {
  console.log(`Saving single GRI category ${categoryId} for company: ${companyId}`);

  // 실제로는 API 호출로 구현:
  // const response = await fetch(`/api/company/${companyId}/gri/${categoryId}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(categoryValue),
  // });
  // return response.ok;

  // 저장 성공 시뮬레이션 (지연 효과)
  await new Promise((resolve) => setTimeout(resolve, 500));

  return true;
}
