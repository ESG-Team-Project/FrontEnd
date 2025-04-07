import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type React from 'react';

export interface LabeledInputBoxProps {
  label: string;
  name?: string;
  value?: string;
  children?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  className?: string;
  type: string;
  direction?: 'row' | 'col';
  width?: string;
  labelWidth?: string;
  required?: boolean;
  error?: string;
}

export default function LabeledInputBox({
  label,
  name,
  value,
  children,
  onChange,
  onBlur,
  className,
  type,
  direction = 'col',
  width,
  labelWidth,
  required = false,
  error,
}: LabeledInputBoxProps) {
  return (
    <div
      className={cn(
        `flex gap-1 ${direction === 'col' ? 'flex-col' : 'flex-row items-center'}`,
        className
      )}
    >
      <Label className={cn('text-gray-700 font-medium', labelWidth)}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={typeof children === 'string' ? children : undefined}
        className={cn(
          'border rounded py-2 px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none',
          error ? 'border-red-500' : '',
          width
        )}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
