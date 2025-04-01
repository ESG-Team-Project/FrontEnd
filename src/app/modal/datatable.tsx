"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DataTable() {
  const [rows, setRows] = React.useState([{ id: 1, columns: ["", ""] }]);
  const [columns, setColumns] = React.useState(["Key", "Value"]);

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].columns[colIndex] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), columns: Array(columns.length).fill("") }]);
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const addColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;
    setColumns([...columns, newColumnName]);
    setRows(rows.map((row) => ({ ...row, columns: [...row.columns, ""] })));
  };

  return (
    <div
      className="p-4"
      style={{
        maxWidth: "100%", // 모달 내부에서 너비 제한
        overflow: "hidden", // 모달 밖으로 삐져나오지 않도록 설정
      }}
    >
      {/* Scrollable container for horizontal scrolling */}
      <ScrollArea
        className="w-full h-[400px] border border-gray-200 overflow-auto"
        style={{
          maxWidth: "100%", // 부모 요소의 너비를 초과하지 않도록 설정
          overflowX: "auto", // 가로 스크롤 허용
          overflowY: "hidden", // 세로 스크롤 비활성화
        }}
      >
        <div
          className="w-max" // 테이블의 너비를 내용에 맞게 설정
          style={{
            minWidth: "100%", // 최소 너비를 모달 너비에 맞춤
            width: `${150 * columns.length}px`, // 컬럼 개수에 따라 동적으로 너비 설정
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, colIndex) => (
                  <TableHead key={colIndex} className="min-w-[150px]">
                    {col}
                  </TableHead>
                ))}
                <TableHead className="min-w-[100px]">
                  <button onClick={addColumn} className="text-blue-500">
                    <Plus size={32} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.columns.map((cell, colIndex) => (
                    <TableCell key={colIndex} className="min-w-[150px]">
                      <Input
                        value={cell}
                        onChange={(e) =>
                          handleInputChange(
                            rows.findIndex((r) => r.id === row.id),
                            colIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Enter ${columns[colIndex]}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="flex gap-2 min-w-[100px]">
                    <button className="text-gray-500">
                      <Edit size={24} />
                    </button>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={24} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      <button
        onClick={addRow}
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-black-600"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}