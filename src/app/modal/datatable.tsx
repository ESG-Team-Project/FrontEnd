'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit } from 'lucide-react';
import { ChartData } from '@/types/chart';

interface DataTableProps {
  initialLabels?: string[];
  initialDatasets?: ChartData['datasets'];
  onDataChange: (labels: string[], datasets: ChartData['datasets']) => void;
}

export default function DataTable({
  initialLabels = [],
  initialDatasets = [],
  onDataChange,
}: DataTableProps) {
  const [columns, setColumns] = React.useState<string[]>(() => {
    if (initialLabels.length > 0) {
      const datasetLabels = initialDatasets?.map(ds => ds?.label || '') || [];
      return ['Label', ...datasetLabels];
    }
    return ['Label', 'Value'];
  });

  const [rows, setRows] = React.useState(() => {
    if (initialLabels.length > 0) {
      return initialLabels.map((label, index) => ({
        id: Date.now() + index,
        columns: [label, ...(initialDatasets?.map(ds => ds?.data?.[index] ?? '') || [])],
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
    setRows(rows.filter(row => row.id !== rowId));
  };

  const addColumn = () => {
    const newColumnName = `데이터셋 ${columns.length}`;
    setColumns([...columns, newColumnName]);
    setRows(rows.map(row => ({ ...row, columns: [...row.columns, ''] })));
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
  // Blur the input to remove focus
      };

      return (
        <Input
          value={localValue}
          // onClick={(e) => e.stopPropagation()}
          // onMouseDown={(e) => e.stopPropagation()}
          onChange={e => {setLocalValue(e.target.value);}}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="text-sm h-8 min-w-full"
        />

      );
    }
  );

  return (
    <div
      className="relative w-full h-[480px] border border-gray-200 overflow-auto"
      ref={containerRef}
      onScroll={handleScroll}
    >

      <Table className="w-full">
      <TableHeader className='sticky top-0 bg-white z-10 shadow-md'>
          <TableRow className='min-w-full'>
          {columns.map((col, colIndex) => (
            <TableHead
              key={colIndex}
              className={`min-w-full ${colIndex > 0 ? 'cursor-pointer' : ''}`}
              onDoubleClick={() => handleColumnHeaderDoubleClick(colIndex)}
            >
              
              {editingColumnIndex === colIndex ? (

                <Input
                  ref={inputRef}
                  value={tempColumnName}
                  onChange={handleColumnNameChange}
                  onBlur={handleColumnNameBlur}
                  onKeyDown={handleColumnNameKeyDown}
                  autoFocus
                  className="text-sm"
                />
               
              ) : (

                
                <>{col}</>  
                
              )}
         

         </TableHead>
          ))}
          <TableHead >
            <button onClick={addColumn} className="text-blue-500 ">
              <Plus size={32}/>
            </button>
            </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody className=' bg-white' >
          <TableRow style={{ height: topPadding}} >
            <TableCell colSpan={columns.length} />
          </TableRow>

          {visibleRows.map((row, i) => (
            <TableRow key={row.id}>
              {row.columns.map((cell, colIndex) => (
                <TableCell
                key={colIndex}
                className="min-w-[150px] focus:outline-none focus:ring-0 p-1"
                
              >
                <EditableCell
                  value={cell}
                  onChange={val => handleInputChange(startIndex + i, colIndex, val)}
                  placeholder={`Enter ${columns[colIndex]}`}
                />
              </TableCell>
              ))}
              <TableCell className="flex min-w-[100px]">
                <button className="text-gray-500">
                  <Edit size={24} />
                </button>
                <button onClick={() => deleteRow(row.id)} className="text-red-500">
                  <Trash2 size={24} />
                </button>
              </TableCell>
            </TableRow>
          ))}

        </TableBody>



      </Table>

    </div>

  );
}
