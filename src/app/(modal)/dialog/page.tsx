"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ESGChartDialog } from "./dialog-form";

export default function DialogPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Button onClick={() => setOpen(true)} variant="outline">
        ESG 차트 열기
      </Button>
      <ESGChartDialog open={open} setOpen={setOpen} />
    </div>
  );
}
