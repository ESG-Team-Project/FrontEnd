"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FileInputDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv", "text/plain"] },
  });

  const handleSave = () => {
    console.log("저장된 파일 목록:", files);
    alert("파일이 저장되었습니다!");
  };

  // 파일 삭제 함수
  const removeFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-lg p-6 bg-white dark:bg-gray-900 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">파일 추가</DialogTitle>
        </DialogHeader>

        {/* 파일 업로드 영역 */}
        <div
          {...getRootProps()}
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 dark:hover:border-gray-400"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md whitespace-nowrap">
              CSV 파일을 추가하려면 파일 선택 또는 여기로 파일을 끌고 오세요
            </p>
          </div>
        </div>

        {/* 업로드된 파일 리스트 */}
        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300 font-bold">
              업로드된 파일
            </p>
            <ul className="mt-2 space-y-1">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="flex justify-between items-center text-gray-600 dark:text-gray-300 text-sm border-b py-2"
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
                className="w-1/8 mt-4 bg-black text-white hover:bg-white hover:text-black border border-black px-4 py-2 rounded"
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
