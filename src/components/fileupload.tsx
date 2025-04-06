'use client';
import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv', 'text/plain'] },
  });

  return (
    <div className="flex flex-col items-center w-full">
      <div
        {...getRootProps()}
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 dark:hover:border-gray-400 w-full max-w-md"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <Upload className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md whitespace-nowrap">
            CSV 파일을 추가하려면 파일 선택 또는 여기로 파일을 끌고 오세요
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 w-full max-w-md">
          <p className="text-gray-700 dark:text-gray-300 font-semibold">업로드된 파일:</p>
          <ul className="mt-2 space-y-1">
            {files.map((file) => (
              <li key={file.name} className="text-gray-600 dark:text-gray-300 text-sm">
                📂 {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
