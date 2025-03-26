import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";

type LabeledInputBoxProps = {
  label: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type: string;
  direction?: "row" | "col";
};

export default function LabeledInputBox({
  label,
  name,
  value,
  onChange,
  className,
  type,
  direction = "col",
}: LabeledInputBoxProps) {
  return (
    <div
      className={cn(
        `flex ${
          direction === "row" ? "items-center gap-2" : "flex-col"
        } ${className} flex justify-between w-full`
      )}
    >
      <Label>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="max-w-75"
      />
    </div>
  );
}
