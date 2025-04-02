'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import api  from '@/lib/api/axios';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FileInputDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [csvData, setCsvData] = useState<Map<number, Record<number, string>>>(new Map());
  const [maxColumns, setMaxColumns] = useState<number>(0);

  const handleSave = async () => {
    if (files.length === 0) return;

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', '1');
      formData.append('dataType', 'gri');

      const res = await api.post('/data-import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('업로드 성공:', res.data);
      alert('파일이 성공적으로 업로드되었습니다!');
      setFiles([]);
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);
      alert('파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }

    setOpen(false);
    setCsvData(new Map());
    setMaxColumns(0);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const csvText = reader.result as string;
        const parsedData = parseCSV(csvText);
        setCsvData(parsedData);

        let maxCols = 0;
        parsedData.forEach((row) => {
          maxCols = Math.max(maxCols, Object.keys(row).length);
        });
        setMaxColumns(maxCols);
      };

      reader.readAsText(file);
    }
    setFiles(acceptedFiles);
  }, []);

  const parseCSV = (csvText: string): Map<number, Record<number, string>> => {
    const rows = csvText.split('\n').map((row) => row.trim());
    const result = new Map<number, Record<number, string>>();

    rows.forEach((row, rowIndex) => {
      const columns = row.split(',');
      const rowObject: Record<number, string> = {};
      columns.forEach((column, colIndex) => {
        rowObject[colIndex] = column;
      });
      result.set(rowIndex, rowObject);
    });

    return result;
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
  });

  const removeFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    setCsvData(new Map());
    setMaxColumns(0);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-lg p-6 bg-white rounded-lg dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">파일 추가</DialogTitle>
          <DialogDescription>업로드할 파일을 선택하거나 드래그하세요.</DialogDescription>
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

        <div>
            
          {/* 테이블 */}
          {files.length ===0? null:
          <div>
            <div>{files[0].name} 미리보기</div>
            <ScrollArea className="w-116  whitespace-nowrap p-1 border">
              <Table>
                <TableCaption>A list of your uploaded CSV.</TableCaption>
                  {csvData.size === 0 ? null :
                  
                    <TableHeader>
                      <TableRow key={0}>
                    {Array.from({ length: maxColumns+1 }).map((_, colIndex) => (
                  <TableHead key={colIndex} className='min-w-max border p-2 overflow-hidden  whitespace-nowrap border-amber-400' onClick={(e) => (e.currentTarget.contentEditable = "true")}
                  onBlur={(e) => (e.currentTarget.contentEditable = "true")}>{colIndex===0?"행|열":`${colIndex}`}</TableHead>
                  ))}
                    </TableRow>
                    </TableHeader>
                  }
                    <TableBody >
              {/* 데이터가 없으면 "업로드된 파일이 없습니다." 표시 */}
              {csvData.size === 0 ? (
                <TableRow>
                  <TableCell colSpan={maxColumns+1} >업로드된 파일이 없습니다.</TableCell>
                </TableRow>
              ) : (
                Array.from(csvData.entries()).slice(0, 5).map(([key, row], rowIndex) => (
                  <TableRow key={key+1} >             
                    {Array.from({ length: maxColumns+1 }).map((_, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className={cellIndex ===0?'max-w-12 min-w-12 p-2 border border-amber-400 overflow-hidden whitespace-nowrap':'max-w-12 min-w-12 p-2 border overflow-hidden whitespace-nowrap cursor-pointer'}
                          onClick={(e)=>{cellIndex ===0?(e.currentTarget.contentEditable = 'false'):(e.currentTarget.contentEditable = 'true')}}
                        onBlur={(e)=>{cellIndex ===0?(e.currentTarget.contentEditable = 'false'):(e.currentTarget.contentEditable = 'true')}}
                      >
                        {cellIndex===0?rowIndex+1:(row[cellIndex-1] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              
              )}
            </TableBody>
            

          </Table>
          <ScrollBar orientation="horizontal" />
          </ScrollArea>
          </div>
        }
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
