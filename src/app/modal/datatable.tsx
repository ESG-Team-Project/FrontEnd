'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import type { ChartData } from '@/types/chart';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface DataTableProps {
  initialLabels?: string[] | number[];
  initialDatasets?: ChartData['datasets'];
  onDataChange: (labels: string[] | number[], datasets: ChartData['datasets']) => void;
}

export default function DataTable({
  initialLabels = [],
  initialDatasets = [],
  onDataChange,
}: DataTableProps) {

  
  const [columns, setColumns] = React.useState<string[]>(() => {
    if (initialLabels && initialLabels.length > 0) {
      const datasetLabels = initialDatasets?.map((ds) => ds?.label || '') || [];
      return ['Label', ...datasetLabels];
    }
    return ['Label', 'Value'];
  });

  const [rows, setRows] = React.useState(() => {
    if (initialLabels.length > 0) {
      return initialLabels.map((label, index) => ({
        id: Date.now() + index,
        columns: [label, ...(initialDatasets?.map((ds) => ds?.data?.[index] ?? '') || [])],
      }));
    }
    return [{ id: Date.now(), columns: Array(columns.length).fill('') }];
  });

  const [editingColumnIndex, setEditingColumnIndex] = React.useState<number | null>(null);
  const [tempColumnName, setTempColumnName] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const rowHeight = 48;
  const [scrollTop, setScrollTop] = React.useState(0);
  const visibleRowCount = 13;

  const totalHeight = rows.length * rowHeight;
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(rows.length, startIndex + visibleRowCount);
  const visibleRows = rows.slice(startIndex, endIndex);
  const topPadding = startIndex * rowHeight;
  const bottomPadding = totalHeight - (endIndex * rowHeight);
  const MAX_WHEEL_DELTA = 100;
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
  
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
  
      const limitedDelta = Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, e.deltaY));
      const newScrollTop = Math.max(
        0,
        Math.min(container.scrollHeight, container.scrollTop + limitedDelta)
      );
  
      container.scrollTop = newScrollTop;
    };
  
    container.addEventListener('wheel', wheelHandler, { passive: false });
  
    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, []);
  

  React.useEffect(() => {
    const newLabels = rows.map((row) => row.columns[0]);
    const newDatasets: ChartData['datasets'] = columns.slice(1).map((colName, colIndex) => ({
      label: colName,
      data: rows.map((row) => {
        const value = row.columns[colIndex + 1];
        const numericValue = Number(value);
        return Number.isNaN(numericValue) ? 0 : numericValue;
      }),
    }));
    onDataChange(newLabels, newDatasets);
  }, [rows, columns, onDataChange]);

  React.useEffect(() => {
    if (editingColumnIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingColumnIndex]);

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const row = { ...updated[rowIndex] };
      row.columns = [...row.columns];
      row.columns[colIndex] = value;
      updated[rowIndex] = row;
      return updated;
    });
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), columns: Array(columns.length).fill('') }]);
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const addColumn = () => {
    const newColumnName = `데이터셋 ${columns.length}`;
    setColumns([...columns, newColumnName]);
    setRows(rows.map((row) => ({ ...row, columns: [...row.columns, ''] })));
  };

  const handleColumnHeaderDoubleClick = (index: number) => {
    if (index === 0) return;
    setTempColumnName(columns[index]);
    setEditingColumnIndex(index);
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const EditableCell = React.memo(
    ({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
    }) => {
      const [localValue, setLocalValue] = React.useState(value);

      React.useEffect(() => {
        setLocalValue(value);
      }, [value]);

      const handleBlur = () => {
        if (localValue !== value) {
          onChange(localValue);
        }
      };

      return (
        <Input
          value={localValue}
          onChange={e => {setLocalValue(e.target.value);}}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="text-sm h-8 min-w-full"
        />
      );
    }
  );

  return (
    <div className="p-4">
      <div className="relative w-full h-[400px] border border-gray-200 overflow-y-auto overflow-x-auto">
        <div className="w-max" style={{ minWidth: '100%' }}>
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 border-b">
              <TableRow>
                {columns.map((col, colIndex) => (
                  <TableHead
                    key={`col-${colIndex}`}
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
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={addColumn} className="text-blue-500" title="컬럼 추가">
                      <Plus size={24} />
                    </button>
                    <button 
                      type="button" 
                      onClick={addRow} 
                      className="text-green-500 ml-2" 
                      title="행 추가"
                    >
                      <Plus size={24} className="transform rotate-90" />
                    </button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.columns.map((cell, colIndex) => (
                    <TableCell key={`cell-${row.id}-${colIndex}`} className="min-w-[150px]">
                      <Input
                        value={cell}
                        onChange={(e) => handleInputChange(rows.findIndex((r) => r.id === row.id), colIndex, e.target.value)}
                        className="border-none focus:ring-0"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="flex gap-2 min-w-[100px]">
                    <button type="button" className="text-gray-500">
                      <Edit size={24} />
                    </button>
                    <button type="button" onClick={() => deleteRow(row.id)} className="text-red-500">
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
        type="button"
        onClick={addRow}
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-black-600"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
