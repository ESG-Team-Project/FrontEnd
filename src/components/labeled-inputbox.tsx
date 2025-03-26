import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import React from "react"
import { Input } from "./ui/input"

type InputBoxProps = {
  label: string
  children?: string
  className?: string
  type : string
}

export default function LabeledInputBox(props: InputBoxProps) {
  const { label, children, className, type} = props
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="text-gray-700 font-medium">{label}</Label>
      <Input 
        type={type} 
        placeholder={children} 
        required 
        className="border rounded py-2 px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
      />
    </div>
  )
}
