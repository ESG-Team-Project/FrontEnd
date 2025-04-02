'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api/axios';
import { DataFrame } from '@/lib/api/dataFrame';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FileInputDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [dataFrame, setDataFrame] = useState<DataFrame | null>(null);
  const [maxColumns, setMaxColumns] = useState<number>(0);
  const [text, setText] = useState("Click to Edit");
  useEffect(() => {
    if (files.length > 0) {
      const file = files[0];
      const df = new DataFrame(file);
      df.init().then(() => {
        setDataFrame(df);
        const maxCols = Math.max(...Array.from(df.data.values()).map(row => Object.keys(row).length), 0);
        setMaxColumns(maxCols);
      });
    }
  }, [files]);

  const handleSave = async () => {
    if (!dataFrame) return;

    try {
      const payload = {
        file: JSON.stringify(Array.from(dataFrame.data.entries())), // JSON 형태로 변환하여 업로드
        companyId: 1,
        dataType: 'gri',
      };

      const res = await api.post('/data-import/csv', payload);

      console.log('업로드 성공:', res.data);
      alert('파일이 성공적으로 업로드되었습니다!');
      setFiles([]);
      setDataFrame(null);
      setMaxColumns(0);
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);
      alert('파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }

    setOpen(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv', 'text/plain'] },
  });

  const removeFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setDataFrame(null);
    setMaxColumns(0);
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
          className="w-full p-6 text-center border border-gray-300 rounded-lg cursor-pointer dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center w-full">
            <Upload className="w-full h-10 text-gray-500 dark:text-gray-400" />
            <p className="w-full mt-2 text-gray-600 dark:text-gray-300">
              CSV 파일을 추가하려면 파일 선택 <br /> 또는 여기로 파일을 끌고 오세요
            </p>
          </div> 
        </div>

        {/* 테이블 */}
        {dataFrame && (
          <div>
            <div>{files[0]?.name} 미리보기</div>
            <ScrollArea className="w-116 whitespace-nowrap p-1 border">
              <Table>
                <TableCaption>A list of your uploaded CSV.</TableCaption>
                {dataFrame.data.size > 0 && (
                  <TableHeader>
                    <TableRow className='border border-emerald-700 '>
                      <TableHead className='border border-emerald-700 p-2'>행|열</TableHead>
                      {Array.from({ length: maxColumns }).map((_, colIndex) => (
                        <TableHead key={colIndex} 
                        className='border p-2 border-emerald-700 min-w-max'
                        onClick= {(e)=>{e.currentTarget.contentEditable="true"}}
                        onBlur={(e) => {setText(e.currentTarget.innerText); 
                        e.currentTarget.contentEditable = "false"; 
                      }}
                        >
                          {colIndex + 1 ||""}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                )}

                <TableBody>
                  {dataFrame.data.size === 0 ? (
                    <TableRow>
                      <TableCell colSpan={maxColumns + 1}>업로드된 파일이 없습니다.</TableCell>
                    </TableRow>
                  ) : (
                    Array.from(dataFrame.data.entries()).slice(0, 5).map(([rowIndex, row]) => (
                      <TableRow key={rowIndex}>
                        <TableCell className='border border-emerald-700 p-2'>{rowIndex + 1}</TableCell>
                        {Array.from({ length: maxColumns }).map((_, colIndex) => (
                          <TableCell
                            key={colIndex}
                            className=' p-2 border cursor-pointer overflow-hidden whitespace-nowrap min-w-12 max-w-12'
                            contentEditable={false}
                          >
                            {row[colIndex] || ''}
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
        )}

        {/* 업로드된 파일 리스트 */}
        {files.length > 0 && (
          <div className="mt-4">
            <p className="font-bold text-gray-700 dark:text-gray-300">업로드된 파일</p>
            <ul className="mt-2 space-y-1">
              {files.map(file => (
                <li key={file.name} className="flex items-center justify-between py-2 text-sm text-gray-600 border-b dark:text-gray-300">
                  📂 {file.name}
                  <button onClick={() => removeFile(file.name)} className="text-black-500 hover:text-black-700">
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
