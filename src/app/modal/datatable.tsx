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
import { ChartData } from '@/types/chart';

interface DataTableProps {
  initialLabels?: string[];
  initialDatasets?: ChartData['datasets'];
  onDataChange: (labels: string[], datasets: ChartData['datasets']) => void;
}

export default function DataTable({ initialLabels = [], initialDatasets = [], onDataChange }: DataTableProps) {
  const [columns, setColumns] = React.useState<string[]>(() => {
    if (initialLabels && initialLabels.length > 0) {
      const datasetLabels = initialDatasets?.map(ds => ds?.label || '') || [];
      return ['Label', ...datasetLabels];
    } 
    return ["Label", "Value"];
  });

  const [rows, setRows] = React.useState(() => {
    if (initialLabels && initialLabels.length > 0) {
      return initialLabels.map((label, index) => ({
        id: Date.now() + index,
        columns: [label, ...(initialDatasets?.map(ds => ds?.data?.[index] ?? '') || [])]
      }));
    }
    return [{ id: Date.now(), columns: Array(columns.length).fill("") }];
  });

  const [editingColumnIndex, setEditingColumnIndex] = React.useState<number | null>(null);
  const [tempColumnName, setTempColumnName] = React.useState<string>('');

  React.useEffect(() => {
    const newLabels = rows.map(row => row.columns[0]);
    const newDatasets: ChartData['datasets'] = columns.slice(1).map((colName, colIndex) => ({
      label: colName,
      data: rows.map(row => {
        const value = row.columns[colIndex + 1];
        const numericValue = Number(value);
        return isNaN(numericValue) ? 0 : numericValue;
      }),
    }));
    onDataChange(newLabels, newDatasets);
  }, [rows, columns, onDataChange]);

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
    const newColumnName = `데이터셋 ${columns.length}`;
    setColumns([...columns, newColumnName]);
    setRows(rows.map((row) => ({ ...row, columns: [...row.columns, ""] })));
  };

  const handleColumnHeaderDoubleClick = (index: number) => {
    if (index === 0) return;
    setEditingColumnIndex(index);
    setTempColumnName(columns[index]);
  };

  const handleColumnNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempColumnName(event.target.value);
  };

  const handleColumnNameBlur = () => {
    if (editingColumnIndex !== null && editingColumnIndex > 0) {
      const newColumns = [...columns];
      newColumns[editingColumnIndex] = tempColumnName.trim() || columns[editingColumnIndex]; 
      setColumns(newColumns);
    }
    setEditingColumnIndex(null);
  };

  const handleColumnNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleColumnNameBlur();
    }
  };

  return (
    <div className="p-4">
      <div className="relative w-full h-[400px] border border-gray-200 overflow-y-auto overflow-x-auto">
        <div className="w-max" style={{ minWidth: "100%" }}>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, colIndex) => (
                  <TableHead 
                    key={colIndex} 
                    className={`min-w-[150px] ${colIndex > 0 ? 'cursor-pointer' : ''}`}
                    onDoubleClick={() => handleColumnHeaderDoubleClick(colIndex)}
                  >
                    {editingColumnIndex === colIndex ? (
                      <Input
                        value={tempColumnName}
                        onChange={handleColumnNameChange}
                        onBlur={handleColumnNameBlur}
                        onKeyDown={handleColumnNameKeyDown}
                        autoFocus
                        className="h-8 text-sm"
                      />
                    ) : (
                      col
                    )}
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
      </div>
      <button
        onClick={addRow}
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-black-600"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}