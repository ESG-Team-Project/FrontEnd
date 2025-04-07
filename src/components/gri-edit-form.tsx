'use client';

import { CustomButton } from '@/components/ui/custom-button'; // CustomButton 추가
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // shadcn/ui 경로 확인
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // shadcn/ui 경로 확인
import type { GRICategory } from '@/data/griCategories'; // 경로 확인
import type { GRIGroup } from '@/data/griGroups'; // 경로 확인
import type {
  CompanyGRICategoryValue,
  CompanyGRIData,
  TimeSeriesDataPoint,
} from '@/types/companyGriData'; // TimeSeriesDataPoint 임포트
import { useEffect, useState } from 'react';
import { GriEditModal } from './gri-edit-modal'; // 새로 분리한 모달 컴포넌트 임포트
import { toast } from '@/components/ui/use-toast';

interface GriEditFormProps {
  initialData: CompanyGRIData;
  griCategories: GRICategory[];
  griGroups: GRIGroup[];
  onChange?: (data: CompanyGRIData) => void;
}

// 모달에서 편집할 데이터의 타입
interface EditingCategory {
  category: GRICategory;
  currentValue: CompanyGRICategoryValue;
}

// 타입 수정 - 서로 겹치지 않는 리터럴 타입으로 명확하게 정의
type GRIDataType = 'text' | 'timeSeries' | 'numeric';

// GRI 그룹 ID를 카테고리 ID에서 추출하는 헬퍼 함수
const getGroupIdFromCategoryId = (categoryId: string): string => {
  // 예: '102-1' -> 'GRI 100', '201-1' -> 'GRI 200'
  const prefix = categoryId.split('-')[0];

  // 첫 번째 숫자를 추출하여 100 단위로 그룹화
  if (prefix.startsWith('1')) return 'GRI 100'; // 100번대 (101, 102, 103 등) -> 'GRI 100'
  if (prefix.startsWith('2')) return 'GRI 200'; // 200번대 -> 'GRI 200'
  if (prefix.startsWith('3')) return 'GRI 300'; // 300번대 -> 'GRI 300'
  if (prefix.startsWith('4')) return 'GRI 400'; // 400번대 -> 'GRI 400'

  return ''; // 매칭 안될 경우
};

// 데이터 일관성 검증 함수 추가
const verifyDataConsistency = async (
  categoryId: string, 
  updatedValue: CompanyGRICategoryValue
): Promise<boolean> => {
  try {
    // 저장한 데이터와 서버에서 다시 조회한 데이터 비교
    const { getCompanyGriDataFormatted } = await import('@/lib/api/gri');
    const freshData = await getCompanyGriDataFormatted();
    
    // 해당 카테고리 아이템 찾기
    const freshValue = freshData.griValues[categoryId];
    
    if (!freshValue) {
      console.warn(`데이터 일관성 문제: 서버에서 카테고리 ${categoryId}를 찾을 수 없습니다.`);
      return false;
    }
    
    // 데이터 타입에 따른 비교
    if (updatedValue.dataType === 'text') {
      if (freshValue.textValue !== updatedValue.textValue) {
        console.warn('데이터 일관성 문제: 텍스트 값이 일치하지 않습니다.', {
          saved: updatedValue.textValue,
          fresh: freshValue.textValue
        });
        return false;
      }
    } else if (updatedValue.dataType === 'numeric') {
      if (freshValue.numericValue !== updatedValue.numericValue) {
        console.warn('데이터 일관성 문제: 숫자 값이 일치하지 않습니다.', {
          saved: updatedValue.numericValue,
          fresh: freshValue.numericValue
        });
        return false;
      }
    } else if (updatedValue.dataType === 'timeSeries') {
      // 시계열 데이터는 마지막 항목만 간단하게 비교
      const savedLastItem = updatedValue.timeSeriesData && updatedValue.timeSeriesData.length > 0 ?
        updatedValue.timeSeriesData[updatedValue.timeSeriesData.length - 1] : null;
      
      const freshLastItem = freshValue.timeSeriesData && freshValue.timeSeriesData.length > 0 ?
        freshValue.timeSeriesData[freshValue.timeSeriesData.length - 1] : null;
      
      if (!savedLastItem && !freshLastItem) {
        // 둘 다 비어있으면 일치
        return true;
      }
      
      if (!savedLastItem || !freshLastItem) {
        console.warn('데이터 일관성 문제: 시계열 데이터의 존재 여부가 다릅니다.');
        return false;
      }
      
      if (savedLastItem.year !== freshLastItem.year || 
          savedLastItem.value !== freshLastItem.value) {
        console.warn('데이터 일관성 문제: 시계열 마지막 항목이 일치하지 않습니다.', {
          saved: savedLastItem,
          fresh: freshLastItem
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('데이터 일관성 검증 중 오류:', error);
    return false;
  }
};

export default function GriEditForm({
  initialData,
  griCategories,
  griGroups,
  onChange,
}: GriEditFormProps) {
  const [formData, setFormData] = useState<Record<string, CompanyGRICategoryValue>>(
    initialData.griValues
  );
  const [selectedGroup, setSelectedGroup] = useState<string>('all'); // 기본값: 전체 보기
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false); // 저장 상태 추가
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null); // 저장 메시지 상태 추가

  // 모달 상태 분리: 텍스트용, 시계열용, 수치용
  const [modalTextValue, setModalTextValue] = useState<string | null>('');
  const [modalTimeSeriesData, setModalTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [modalNumericValue, setModalNumericValue] = useState<number | null>(null);
  const [modalNumericUnit, setModalNumericUnit] = useState<string>('');
  const [modalDecimalPlaces, setModalDecimalPlaces] = useState<number>(0);

  // 컴포넌트 마운트 시 또는 initialData 변경 시 formData 초기화 강화
  useEffect(() => {
    console.log("initialData 변경감지: formData 갱신 중");
    const initialFormValues: Record<string, CompanyGRICategoryValue> = {};
    
    for (const cat of griCategories) {
      const existingValue = initialData.griValues[cat.id];
      
      // 기존 데이터가 있으면 그대로 사용
      if (existingValue) {
        initialFormValues[cat.id] = {...existingValue};
      } else {
        // 새 카테고리라면 빈 데이터 생성
        initialFormValues[cat.id] = {
          categoryId: cat.id,
          dataType: cat.defaultDataType as 'timeSeries' | 'text' | 'numeric',
          timeSeriesData: cat.defaultDataType === 'timeSeries' ? [] : undefined,
          textValue: cat.defaultDataType === 'text' ? '' : null,
          numericValue: cat.defaultDataType === 'numeric' ? 0 : null
        };
      }
    }
    
    setFormData(initialFormValues);
  }, [initialData, griCategories]);

  // 모달 열기
  const handleOpenModal = (category: GRICategory) => {
    // formData에서 현재 카테고리 데이터 가져오기 (useEffect에서 생성 보장)
    const currentValue = formData[category.id];
    const dataType = currentValue.dataType as GRIDataType;

    setEditingCategory({ category, currentValue });

    // dataType에 따라 모달 상태 초기화
    switch (dataType) {
      case 'text':
        setModalTextValue(currentValue.textValue ?? '');
        setModalTimeSeriesData([]); // 다른 타입 상태 초기화
        setModalNumericValue(null);
        setModalNumericUnit('');
        setModalDecimalPlaces(0);
        break;

      case 'timeSeries': {
        // timeSeriesData가 배열이 아니면 빈 배열로 초기화
        const timeSeriesData = Array.isArray(currentValue.timeSeriesData)
          ? [...currentValue.timeSeriesData.map((d) => ({ ...d }))]
          : [];

        setModalTimeSeriesData(timeSeriesData); // 깊은 복사
        setModalTextValue(''); // 다른 타입 상태 초기화
        setModalNumericValue(null);
        setModalNumericUnit('');
        setModalDecimalPlaces(0);
        break;
      }

      case 'numeric':
        setModalNumericValue(
          currentValue.numericValue !== undefined ? currentValue.numericValue : null
        );
        setModalNumericUnit(currentValue.numericUnit || '');
        setModalDecimalPlaces(
          currentValue.decimalPlaces !== undefined ? currentValue.decimalPlaces : 0
        );
        setModalTextValue(''); // 다른 타입 상태 초기화
        setModalTimeSeriesData([]);
        break;
    }

    setIsModalOpen(true);
  };

  // 모달 상태 변경 핸들러
  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // 모달이 닫힐 때 editingCategory 초기화
      setEditingCategory(null);
    }
  };

  // 모달에서 저장 이벤트 처리
  const handleSave = async (categoryId: string, updatedValue: CompanyGRICategoryValue) => {
    try {
      setIsSaving(true);

      // 폼 데이터 업데이트
      const updatedFormData = {
        ...formData,
        [categoryId]: updatedValue,
      };

      // 서버 API 호출하여 데이터 저장
      const { saveSingleGriCategory, getCompanyGriDataFormatted } = await import('@/lib/api/gri');
      const success = await saveSingleGriCategory(categoryId, updatedValue);

      if (success) {
        // 성공 시 로컬 상태 업데이트 (먼저 업데이트)
        setFormData(updatedFormData);

        // 부모 컴포넌트에 알림
        if (onChange) {
          const updatedData: CompanyGRIData = {
            ...initialData,
            griValues: updatedFormData,
          };
          onChange(updatedData);
          
          try {
            // 서버에서 최신 데이터를 다시 가져오기
            console.log("서버에서 최신 데이터를 다시 로드합니다.");
            const refreshedData = await getCompanyGriDataFormatted();
            
            // 데이터 일관성 검증
            const isConsistent = await verifyDataConsistency(categoryId, updatedValue);
            
            if (isConsistent) {
              // 성공 메시지 표시
              toast({
                title: "저장 성공",
                description: "데이터가 성공적으로 저장되었습니다.",
                variant: "default",
              });
              
              // 최신 데이터 설정 (방금 수정한 항목은 유지)
              const mergedData = {
                ...refreshedData,
                griValues: {
                  ...refreshedData.griValues,
                  [categoryId]: updatedValue  // 방금 수정한 항목은 항상 최신으로 유지
                }
              };
              onChange(mergedData);
            } else {
              // 경고 메시지 표시
              toast({
                title: "일부 불일치 감지",
                description: "데이터가 저장되었으나 서버와 일부 불일치가 감지되었습니다.",
                variant: "destructive",
              });
              
              // 최신 데이터로 강제 업데이트
              onChange(refreshedData);
            }
          } catch (refreshError) {
            console.error("데이터 새로고침 실패:", refreshError);
            // 새로고침 실패 시 오류 알림
            toast({
              title: "데이터 갱신 오류",
              description: "저장 후 최신 데이터를 불러오는 중 오류가 발생했습니다.",
              variant: "destructive",
            });
          }
        }

        return true;
      }

      // 저장 실패 시 알림
      toast({
        title: "저장 실패",
        description: "데이터 저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
      // 오류 알림
      toast({
        title: "저장 실패",
        description: "데이터 저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 선택된 그룹에 해당하는 카테고리만 필터링
  const filteredCategories =
    selectedGroup === 'all'
      ? griCategories
      : griCategories.filter((cat) => getGroupIdFromCategoryId(cat.id) === selectedGroup);

  // 현재 값 표시 함수 수정
  const displayCurrentValue = (value: CompanyGRICategoryValue | undefined): string => {
    if (!value) return '-';

    const dataType = value.dataType as GRIDataType;

    switch (dataType) {
      case 'text':
        return value.textValue ?? '-';

      case 'timeSeries':
        if (value.timeSeriesData && value.timeSeriesData.length > 0) {
          const latestYear = Math.max(...value.timeSeriesData.map((d) => d.year));
          const latestData = value.timeSeriesData.find((d) => d.year === latestYear);
          return latestData?.value?.toString() ?? `${value.timeSeriesData.length}개 항목`;
        }
        return '항목 없음';

      case 'numeric':
        if (value.numericValue !== null && value.numericValue !== undefined) {
          const formattedValue =
            value.decimalPlaces !== undefined && value.decimalPlaces > 0
              ? value.numericValue.toFixed(value.decimalPlaces)
              : value.numericValue.toString();
          return `${formattedValue}${value.numericUnit ? ` ${value.numericUnit}` : ''}`;
        }
        return '-';

      default:
        return '-';
    }
  };

  return (
    <form className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label htmlFor="gri-group-select" className="text-sm font-medium">
          GRI 그룹 필터:
        </label>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-full sm:w-[280px]" id="gri-group-select">
            <SelectValue placeholder="그룹 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 보기</SelectItem>
            {griGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.id} - {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 pb-4">
        <div className="min-w-[700px]">
          {' '}
          {/* 테이블의 최소 너비 지정 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">GRI 지표</TableHead>
                <TableHead>지표 내용</TableHead>
                <TableHead className="w-[180px]">현재 값 요약</TableHead>
                <TableHead className="w-[80px]">수정</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.id}</TableCell>
                  <TableCell className="max-w-[420px]">
                    {' '}
                    {/* 너비 증가 */}
                    {/* 구분을 뱃지 형태로 추가 */}
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {category.name}
                      </span>
                    </div>
                    {/* 설명 텍스트 */}
                    {category.description.split('\n').map((line, idx) => (
                      <p key={`${category.id}-line-${idx}`} className="text-sm my-0.5">
                        {line}
                      </p>
                    ))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {displayCurrentValue(formData[category.id])}
                  </TableCell>
                  <TableCell>
                    <CustomButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(category)}
                      className="whitespace-nowrap w-full"
                    >
                      수정
                    </CustomButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 기존 모달을 GriEditModal 컴포넌트로 교체 */}
      <GriEditModal
        isOpen={isModalOpen}
        onOpenChange={handleModalOpenChange}
        editingCategory={editingCategory}
        onSave={handleSave}
      />
    </form>
  );
}
