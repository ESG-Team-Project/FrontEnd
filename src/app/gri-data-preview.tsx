'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { griService } from '@/lib/api';
import type { GriDataItem } from '@/lib/api/gri';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Save } from 'lucide-react';

export default function GriDataPreview() {
  const [griData, setGriData] = useState<GriDataItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GriDataItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // GRI 데이터 가져오기
  useEffect(() => {
    const fetchGriData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API 호출을 try-catch로 감싸서 오류 처리
        try {
          const data = await griService.getAllGriData();
          setGriData(data || []); // 데이터가 없으면 빈 배열 사용
        } catch (apiError) {
          console.error('API 호출 오류:', apiError);
          throw new Error('API 호출 중 오류가 발생했습니다');
        }
      } catch (err) {
        console.error('GRI 데이터 가져오기 오류:', err);
        setError('GRI 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGriData();
  }, []);

  // 항목 저장 함수
  const handleSaveItem = async () => {
    if (!selectedItem) return;
    
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      const success = await griService.saveGriData(selectedItem);
      
      if (success) {
        setSaveMessage('변경사항이 성공적으로 저장되었습니다.');
        
        // 데이터 배열 업데이트
        setGriData(prevData => 
          prevData.map(item => 
            item.id === selectedItem.id ? selectedItem : item
          )
        );
        
        // 3초 후 메시지 제거
        setTimeout(() => {
          setSaveMessage(null);
          setIsModalOpen(false);
        }, 1500);
      } else {
        setSaveMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('GRI 데이터 저장 오류:', err);
      setSaveMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // 항목 수정 다이얼로그 열기
  const openEditDialog = (item: GriDataItem) => {
    setSelectedItem({...item});
    setIsModalOpen(true);
  };

  // 입력 값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedItem) return;
    
    const { name, value } = e.target;
    setSelectedItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value
      };
    });
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl px-4 text-center">
        <p>GRI 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 오류가 발생했을 때 표시
  if (error) {
    return (
      <div className="w-full max-w-6xl px-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // 데이터가 없을 때 표시
  if (!griData || griData.length === 0) {
    return (
      <div className="w-full max-w-6xl px-4 text-center">
        <p>현재 표시할 GRI 데이터가 없습니다.</p>
      </div>
    );
  }

  // 데이터가 있을 때 표시
  return (
    <div className="w-full max-w-6xl px-4">
      <h2 className="mb-4 text-2xl font-bold text-center">GRI 데이터 미리보기</h2>
      <p className="mb-8 text-center text-gray-600">
        최신 GRI 데이터를 확인하세요. 자세한 내용은 대시보드에서 확인할 수 있습니다.
      </p>
      <div className="overflow-auto">
        <table className="w-full bg-white rounded-lg shadow-md">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 text-left">공개코드</th>
              <th className="p-3 text-left">제목</th>
              <th className="p-3 text-left">카테고리</th>
              <th className="p-3 text-left">값</th>
              <th className="p-3 text-left">단위</th>
              <th className="p-3 text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {griData.slice(0, 5).map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">{item.disclosureCode || '-'}</td>
                <td className="p-3">{item.disclosureTitle || '-'}</td>
                <td className="p-3">{item.category || '-'}</td>
                <td className="p-3">
                  {item.disclosureValue || (item.numericValue !== null ? String(item.numericValue) : '-')}
                </td>
                <td className="p-3">{item.unit || '-'}</td>
                <td className="p-3 text-center">
                  <button 
                    type="button"
                    className="p-1 text-blue-600 hover:text-blue-800" 
                    onClick={() => openEditDialog(item)}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-center">
        <Link href="/dashboard/gri">
          <Button variant="outline" className="bg-emerald-600 text-white">
            모든 GRI 데이터 보기
          </Button>
        </Link>
      </div>

      {/* 수정 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>GRI 데이터 수정</DialogTitle>
            <DialogDescription>
              아래 값을 수정한 후 저장 버튼을 클릭하세요.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="disclosureValue" className="text-right">
                  값:
                </label>
                <input
                  id="disclosureValue"
                  name="disclosureValue"
                  className="col-span-3 p-2 border rounded"
                  value={selectedItem.disclosureValue || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="unit" className="text-right">
                  단위:
                </label>
                <input
                  id="unit"
                  name="unit"
                  className="col-span-3 p-2 border rounded"
                  value={selectedItem.unit || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            {saveMessage && (
              <span className={`mr-auto text-sm ${saveMessage.includes('성공') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </span>
            )}
            <Button onClick={handleSaveItem} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? '저장 중...' : <><Save size={16} className="mr-2" /> 저장</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 