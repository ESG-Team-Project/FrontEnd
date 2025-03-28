'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function FileInputDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  // 파일 저장 핸들러
  const handleSave = async () => {
    const formData = new FormData();
    files.forEach(file => {
      // FormData에 파일을 추가합니다.
    formData.append('files', file); // 첫 번째 파일만 저장하는 예시입니다.
  });
  try {
    const res = await fetch('/api/data-import/csv', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('파일 업로드 실패');
    }
    const result = await res.json();
    console.log('파일 업로드 성공:', result);
    alert('파일이 성공적으로 업로드되었습니다!');
    setFiles([]); // 업로드 후 파일 목록 초기화
  } catch (error) {
    console.error('파일 업로드 중 오류 발생:', error);
    alert('파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
    setOpen(false); // 업로드 후 다이얼로그 닫기
  };

  // 파일 업로드 핸들러
  // useCallback을 사용하여 메모이제이션된 콜백 함수를 생성합니다. 
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  // useDropzone 훅을 사용하여 드래그 앤 드롭 기능을 구현합니다.
  // onDrop 핸들러와 accept 옵션을 설정합니다.
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv', 'text/plain'] },
  });

  // 파일 삭제 핸들러
  const removeFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-lg p-6 bg-white rounded-lg dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">파일 추가</DialogTitle>
        </DialogHeader>

        {/* 파일 업로드 영역 */}
        <div
          {...getRootProps()}
          className="w-full p-6 text-center border border-gray-300 rounded-lg cursor-pointer dark:border-gray-600 Ihover:border-gray-500 dark:hover:border-gray-400"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center w-full">
            <Upload className="w-full h-10 text-gray-500 dark:text-gray-400" />
            <p className="w-full mt-2 text-gray-600 dark:text-gray-300">
              CSV 파일을 추가하려면 파일 선택 <br /> 또는 여기로 파일을 끌고 오세요
            </p>
          </div> 
        </div>

        {/* 업로드된 파일 리스트 */}
        {files.length > 0 && (
          <div className="mt-4">
            <p className="font-bold text-gray-700 dark:text-gray-300">업로드된 파일</p>
            <ul className="mt-2 space-y-1">
              {files.map(file => (
                <li
                  key={file.name}
                  className="flex items-center justify-between py-2 text-sm text-gray-600 border-b dark:text-gray-300"
                >
                  📂 {file.name}
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-black-500 hover:text-black-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                className="px-4 py-2 mt-4 text-white bg-black border border-black rounded w-1/8 hover:bg-white hover:text-black"
              >
                저장
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
