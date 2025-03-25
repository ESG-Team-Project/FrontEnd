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

export default function InputBox(props: InputBoxProps) {
  const { label, children, className, type} = props
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label>{label}</Label>
      <Input type={type}  placeholder={children} required />
    </div>
  )
}
