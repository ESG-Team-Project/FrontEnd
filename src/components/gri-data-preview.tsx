'use client';

import { Button } from '@/components/ui/button';
import { griService } from '@/lib/api';
import type { GriDataItem } from '@/lib/api/gri';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function GriDataPreview() {
  const [griData, setGriData] = useState<GriDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
            </tr>
          </thead>
          <tbody>
            {griData.slice(0, 5).map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">{item.disclosureCode || '-'}</td>
                <td className="p-3">{item.disclosureTitle || '-'}</td>
                <td className="p-3">{item.category || '-'}</td>
                <td className="p-3">
                  {item.disclosureValue ||
                    (item.numericValue !== null ? String(item.numericValue) : '-')}
                </td>
                <td className="p-3">{item.unit || '-'}</td>
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
    </div>
  );
}
