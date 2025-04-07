'use client';

import { CustomButton } from '@/components/ui/custom-button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { GRICategory } from '@/data/griCategories';
import type { CompanyGRICategoryValue, TimeSeriesDataPoint } from '@/types/companyGriData';
import { PlusCircle, Trash2, WifiOff } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from './ui/badge';

// GRI 데이터 타입 정의
type GRIDataType = 'text' | 'timeSeries' | 'numeric';

// 간단한 UUID v4 생성 함수
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 모달에서 편집할 데이터의 타입
interface EditingCategory {
  category: GRICategory;
  currentValue: CompanyGRICategoryValue;
}

interface GriEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: EditingCategory | null;
  onSave: (categoryId: string, updatedValue: CompanyGRICategoryValue) => Promise<boolean>;
  isOnline?: boolean;
}

export function GriEditModal({ 
  isOpen, 
  onOpenChange, 
  editingCategory, 
  onSave,
  isOnline = true
}: GriEditModalProps) {
  // 모달 상태
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  // 모달 데이터 상태
  const [modalTextValue, setModalTextValue] = useState<string | null>('');
  const [modalTimeSeriesData, setModalTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [modalNumericValue, setModalNumericValue] = useState<number | null>(null);
  const [modalNumericUnit, setModalNumericUnit] = useState<string>('');
  const [modalDecimalPlaces, setModalDecimalPlaces] = useState<number>(0);
  const [dataType, setDataType] = useState<GRIDataType>('text');

  // editingCategory가 변경될 때 모달 상태 초기화
  useEffect(() => {
    if (!editingCategory) return;

    const currentValue = editingCategory.currentValue;
    const currentDataType = currentValue.dataType as GRIDataType;
    setDataType(currentDataType);

    // dataType에 따라 모달 상태 초기화
    switch (currentDataType) {
      case 'text':
        setModalTextValue(currentValue.textValue ?? '');
        setModalTimeSeriesData([]);
        setModalNumericValue(null);
        setModalNumericUnit('');
        setModalDecimalPlaces(0);
        break;

      case 'timeSeries': {
        // timeSeriesData가 배열이 아니면 빈 배열로 초기화
        const timeSeriesData = Array.isArray(currentValue.timeSeriesData)
          ? [...currentValue.timeSeriesData.map((d) => ({ ...d }))]
          : [];

        setModalTimeSeriesData(timeSeriesData);
        setModalTextValue('');
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
        setModalTextValue('');
        setModalTimeSeriesData([]);
        break;
    }
  }, [editingCategory]);

  // 모달 내 데이터 타입 변경
  const handleModalDataTypeChange = (newDataType: GRIDataType) => {
    if (!editingCategory) return;
    setDataType(newDataType);
  };

  // 모달 내 Textarea 변경
  const handleModalTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setModalTextValue(e.target.value);
  };

  // 모달 내 TimeSeries 데이터 변경
  const handleModalTimeSeriesChange = (
    index: number,
    field: keyof TimeSeriesDataPoint,
    value: string | number
  ) => {
    const updatedData = [...modalTimeSeriesData];
    const item = updatedData[index];

    // 타입 변환 (value, year, quarter, month는 숫자일 수 있음)
    let processedValue: any = value;
    if (field === 'year') {
      // year는 필수 숫자 필드 (null이면 안됨)
      if (value === '') {
        processedValue = new Date().getFullYear(); // 빈 값은 현재 연도로 기본값 설정
      } else {
        const num = Number(value);
        processedValue = Number.isNaN(num) ? new Date().getFullYear() : num;
      }
    } else if (field === 'quarter' || field === 'month') {
      // quarter, month는 선택적 숫자 필드 (null 가능)
      if (value === '') {
        processedValue = null;
      } else {
        const num = Number(value);
        processedValue = Number.isNaN(num) ? null : num;
      }
    } else if (field === 'value') {
      // value는 string 또는 number이므로 null은 안됨
      // 빈 문자열이거나 NaN이면 빈 문자열로 저장 (숫자 입력 필드라면 0으로 저장할 수도 있음)
      processedValue =
        value === '' || (typeof value === 'number' && Number.isNaN(value)) ? '' : value;
    }

    // 타입스크립트의 엄격한 타입 체크를 위해 타입 단언 사용
    (item[field] as any) = processedValue;

    setModalTimeSeriesData(updatedData);
  };

  // 각 항목에 맞는 기본 포맷의 데이터 포인트 생성
  const createTimeSeriesPoint = (
    format: 'year-only' | 'with-quarter' | 'with-month'
  ): TimeSeriesDataPoint => {
    const newPoint: TimeSeriesDataPoint = {
      id: generateId(),
      year: new Date().getFullYear(),
      value: '',
    };

    // 선택된 포맷에 따라 기본값 설정
    if (format === 'with-quarter') {
      // 연도 + 분기 포맷
      newPoint.quarter = 1;
      newPoint.month = null;
    } else if (format === 'with-month') {
      // 연도 + 월 포맷 (분기 필드는 null로 설정)
      newPoint.quarter = null;
      newPoint.month = 1;
    } else {
      // 연도만 포맷
      newPoint.quarter = null;
      newPoint.month = null;
    }

    return newPoint;
  };

  // 간단한 단일 값 추가 함수
  const addSimpleTimeSeriesPoint = () => {
    const newPoint = createTimeSeriesPoint('year-only');
    setModalTimeSeriesData([newPoint]);
  };

  // 시계열 데이터 추가 함수
  const addTimeSeriesDataPoint = (format: 'year-only' | 'with-quarter' | 'with-month') => {
    const newPoint = createTimeSeriesPoint(format);
    setModalTimeSeriesData([...modalTimeSeriesData, newPoint]);
  };

  // 모달 내 TimeSeries 데이터 삭제
  const removeTimeSeriesDataPoint = (idToRemove: string) => {
    setModalTimeSeriesData(modalTimeSeriesData.filter((point) => point.id !== idToRemove));
  };

  // 숫자 입력 값 변경 핸들러
  const handleNumericValueChange = (value: string) => {
    if (value === '') {
      setModalNumericValue(null);
      return;
    }

    // 소수점 제한이 있는 경우
    if (modalDecimalPlaces === 0) {
      // 정수만 허용
      const parsedValue = Number.parseInt(value, 10);
      if (!Number.isNaN(parsedValue)) {
        setModalNumericValue(parsedValue);
      }
    } else {
      // 소수점 허용
      const parsedValue = Number.parseFloat(value);
      if (!Number.isNaN(parsedValue)) {
        // 소수점 자릿수 제한
        setModalNumericValue(Number(parsedValue.toFixed(modalDecimalPlaces)));
      }
    }
  };

  // 숫자 단위 변경 핸들러
  const handleNumericUnitChange = (value: string) => {
    setModalNumericUnit(value);
  };

  // 소수점 자릿수 변경 핸들러
  const handleDecimalPlacesChange = (value: string) => {
    const places = Number.parseInt(value, 10);
    if (!Number.isNaN(places) && places >= 0) {
      setModalDecimalPlaces(places);

      // 현재 값이 있으면 소수점 자릿수에 맞게 변환
      if (modalNumericValue !== null) {
        setModalNumericValue(Number(modalNumericValue.toFixed(places)));
      }
    }
  };

  // 모달에서 저장 버튼 클릭 시 호출되는 함수
  const handleModalSave = async () => {
    if (!editingCategory) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const categoryId = editingCategory.category.id;

      // 현재 값 복사 후 데이터 타입에 따라 업데이트
      const updatedValue: CompanyGRICategoryValue = {
        ...editingCategory.currentValue,
        dataType,
      };

      // 선택한 dataType에 따라 값 업데이트
      switch (dataType) {
        case 'text':
          updatedValue.textValue = modalTextValue;
          break;
        case 'numeric':
          updatedValue.numericValue = modalNumericValue;
          updatedValue.numericUnit = modalNumericUnit;
          updatedValue.decimalPlaces = modalDecimalPlaces;
          break;
        case 'timeSeries':
          updatedValue.timeSeriesData = modalTimeSeriesData;
          break;
      }

      // 상위 컴포넌트의 저장 함수 호출
      const success = await onSave(categoryId, updatedValue);

      if (success) {
        // 오프라인 상태인 경우 다른 메시지 표시
        if (!isOnline) {
          setSaveMessage({
            type: 'success',
            text: `${editingCategory.category.name} 데이터가 로컬에 저장되었습니다.`,
          });
          
          toast({
            title: "로컬 저장 완료",
            description: `${editingCategory.category.name} 데이터가 로컬에 저장되었습니다.`,
            variant: "default",
          });
        } else {
          setSaveMessage({
            type: 'success',
            text: `${editingCategory.category.name} 데이터가 저장되었습니다.`,
          });
          
          toast({
            title: "저장 완료",
            description: `${editingCategory.category.name} 데이터가 저장되었습니다.`,
            variant: "default",
          });
        }

        // 성공 메시지 후 2.5초 후에 모달 닫기 (시간 연장)
        setTimeout(() => {
          setSaveMessage(null);
          // 저장 성공 시 모달 닫기
          onOpenChange(false);
        }, 2500);
      } else {
        setSaveMessage({
          type: 'error',
          text: '데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
        
        // 오류 Toast 메시지 표시
        toast({
          title: "저장 실패",
          description: "데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
      setSaveMessage({
        type: 'error',
        text: '데이터 저장 중 오류가 발생했습니다.',
      });
      
      // 오류 Toast 메시지 표시
      toast({
        title: "저장 실패",
        description: "데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{editingCategory?.category.name} 데이터 편집</span>
            {!isOnline && (
              <Badge variant="outline" className="flex items-center gap-1 ml-2 bg-amber-50">
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">오프라인 모드</span>
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 데이터 타입 선택 */}
        {editingCategory && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b">
            <Label className="font-medium">데이터 타입:</Label>
            <Select
              value={dataType}
              onValueChange={(value: GRIDataType) => handleModalDataTypeChange(value)}
            >
              <SelectTrigger className="w-full sm:w-48 md:w-56">
                <SelectValue placeholder="타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">텍스트 (단일 값)</SelectItem>
                <SelectItem value="numeric">수치 데이터</SelectItem>
                <SelectItem value="timeSeries">시계열 데이터</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 저장 메시지 표시 */}
        {saveMessage && (
          <div
            className={`p-3 mb-2 rounded text-sm ${
              saveMessage.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : saveMessage.type === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-3 pl-1 py-2">
          {(() => {
            if (!editingCategory) return null;

            switch (dataType) {
              case 'text':
                return (
                  <div className="grid gap-4 py-2">
                    <Label htmlFor="modal-text-value">데이터 값</Label>
                    <Textarea
                      id="modal-text-value"
                      value={modalTextValue ?? ''}
                      onChange={handleModalTextChange}
                      rows={10}
                    />
                  </div>
                );

              case 'numeric':
                return (
                  <div className="grid gap-4 py-2">
                    <div>
                      <Label htmlFor="modal-numeric-value">수치 값</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="modal-numeric-value"
                          type="number"
                          value={modalNumericValue !== null ? modalNumericValue : ''}
                          onChange={(e) => handleNumericValueChange(e.target.value)}
                          step={
                            modalDecimalPlaces > 0
                              ? `0.${'0'.repeat(modalDecimalPlaces - 1)}1`
                              : '1'
                          }
                          placeholder="숫자 값 입력"
                          className="flex-1"
                        />
                        <Input
                          value={modalNumericUnit}
                          onChange={(e) => handleNumericUnitChange(e.target.value)}
                          placeholder="단위"
                          className="w-20 sm:w-24"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <Label htmlFor="modal-decimal-places">소수점 자릿수</Label>
                      <div className="mt-2 flex gap-2 items-center">
                        <Input
                          id="modal-decimal-places"
                          type="number"
                          min="0"
                          max="10"
                          value={modalDecimalPlaces}
                          onChange={(e) => handleDecimalPlacesChange(e.target.value)}
                          className="w-20 sm:w-24"
                        />
                        <span className="text-sm text-muted-foreground ml-2">
                          {modalDecimalPlaces === 0
                            ? '정수만 입력 가능'
                            : `소수점 ${modalDecimalPlaces}자리까지 허용`}
                        </span>
                      </div>
                    </div>

                    {modalNumericValue !== null && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="font-medium">미리보기:</p>
                        <p className="text-lg mt-1">
                          {modalDecimalPlaces > 0
                            ? modalNumericValue.toFixed(modalDecimalPlaces)
                            : modalNumericValue.toString()}
                          {modalNumericUnit ? ` ${modalNumericUnit}` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                );
              default:
                return (
                  <div className="py-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <h4 className="font-medium">시계열 데이터 입력</h4>
                      <div className="flex items-center gap-2">
                        <CustomButton
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addSimpleTimeSeriesPoint}
                          className="whitespace-nowrap"
                        >
                          단일 값으로 설정
                        </CustomButton>

                        {/* 팝오버로 데이터 포맷 선택 UI */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <CustomButton type="button" size="sm">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              항목 추가
                            </CustomButton>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3" align="end">
                            <div className="grid gap-3">
                              <h4 className="font-medium text-sm">데이터 포맷 선택</h4>
                              <div className="grid gap-1.5">
                                <CustomButton
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addTimeSeriesDataPoint('year-only')}
                                  className="justify-start text-sm"
                                >
                                  연도만
                                </CustomButton>
                                <CustomButton
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addTimeSeriesDataPoint('with-quarter')}
                                  className="justify-start text-sm"
                                >
                                  연도 + 분기
                                </CustomButton>
                                <CustomButton
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addTimeSeriesDataPoint('with-month')}
                                  className="justify-start text-sm"
                                >
                                  연도 + 월
                                </CustomButton>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="overflow-x-auto -mx-3 px-3 pb-2">
                      {modalTimeSeriesData.length > 0 ? (
                        <div className="w-full md:min-w-full lg:min-w-full">
                          <Table className="border">
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="font-semibold w-24">연도</TableHead>
                                <TableHead className="font-semibold w-16">분기</TableHead>
                                <TableHead className="font-semibold w-16">월</TableHead>
                                <TableHead className="font-semibold w-32">값</TableHead>
                                <TableHead className="font-semibold w-24">단위</TableHead>
                                <TableHead className="font-semibold w-40">비고</TableHead>
                                <TableHead className="font-semibold text-center w-14">
                                  삭제
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {modalTimeSeriesData.map((point, index) => (
                                <TableRow key={point.id}>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={point.year ?? ''}
                                      onChange={(e) =>
                                        handleModalTimeSeriesChange(index, 'year', e.target.value)
                                      }
                                      className="w-full"
                                      placeholder="YYYY"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={point.quarter ?? ''}
                                      onChange={(e) =>
                                        handleModalTimeSeriesChange(
                                          index,
                                          'quarter',
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                      placeholder="1-4"
                                      min="1"
                                      max="4"
                                      disabled={point.quarter === null}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={point.month ?? ''}
                                      onChange={(e) =>
                                        handleModalTimeSeriesChange(index, 'month', e.target.value)
                                      }
                                      className="w-full"
                                      placeholder="1-12"
                                      min="1"
                                      max="12"
                                      disabled={point.month === null}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type={
                                        editingCategory?.category.isQuantitative ? 'number' : 'text'
                                      }
                                      value={point.value ?? ''}
                                      onChange={(e) =>
                                        handleModalTimeSeriesChange(index, 'value', e.target.value)
                                      }
                                      className="w-full"
                                      step={
                                        editingCategory?.category.isQuantitative ? 'any' : undefined
                                      }
                                      placeholder="값 입력"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={point.unit ?? ''}
                                      onChange={(e) =>
                                        handleModalTimeSeriesChange(index, 'unit', e.target.value)
                                      }
                                      className="w-full"
                                      placeholder="단위"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={point.notes ?? ''}
                                      onChange={(e) =>
                                        handleModalTimeSeriesChange(index, 'notes', e.target.value)
                                      }
                                      className="w-full"
                                      placeholder="비고"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <CustomButton
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeTimeSeriesDataPoint(point.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </CustomButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          추가할 데이터 항목이 없습니다.
                        </p>
                      )}
                    </div>
                  </div>
                );
            }
          })()}
        </div>

        <DialogFooter className="pt-2 border-t">
          <div className="flex items-center gap-2 w-full justify-between">
            {!isOnline && (
              <div className="text-amber-500 text-xs flex items-center">
                <WifiOff className="h-3 w-3 mr-1" />
                변경사항은 로컬에 저장됩니다
              </div>
            )}
            <DialogClose asChild>
              <CustomButton type="button" variant="secondary">
                취소
              </CustomButton>
            </DialogClose>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>저장 중...</span>
                </div>
              ) : (
                <CustomButton type="button" onClick={handleModalSave} disabled={isSaving}>
                  저장
                </CustomButton>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
