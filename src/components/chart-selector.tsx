'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  PieChart,
  ChartLine,
  ChartArea,
  ChartColumnBig,
  ChartBarBig,
  ChartPie,
  ChartSpline,
  ChartNoAxesCombined,
  ChartColumnStacked,
  ChartBarStacked
} from 'lucide-react';
import { TbChartDonut } from "react-icons/tb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { SidebarGroupContent } from './ui/sidebar';
import { ESGChartDialog } from '@/app/modal/chartinput-form';
import clsx from 'clsx';

interface ChartSelectorProps {
  isLayoutLocked?: boolean;
}

export default function ChartSelector({ isLayoutLocked = false }: ChartSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);

  return (
    <>
      <div className="flex items-center justify-between py-2 border-b">
        <Collapsible className="w-full group/collapsible">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className={clsx(
                "w-full py-1 h-auto", 
                isLayoutLocked ? "justify-center" : "justify-start"
              )}
            >
              <PieChart className={clsx("w-4 h-4", !isLayoutLocked && "mr-2")} />
              <strong className={clsx("block my-1 text-sm", isLayoutLocked && "hidden")}>차트추가</strong>
              <ChevronDown className={clsx("ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180", isLayoutLocked && "hidden")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className={clsx(isLayoutLocked && "hidden")}>
            <SidebarGroupContent>
              <strong className="block my-1 text-xs">선</strong>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={openModal} className="group">
                  <ChartLine className="w-8 h-8 group-hover:text-blue-500" />
                </button>
                <button type="button" onClick={openModal} className="group">
                  <ChartSpline className="w-8 h-8 group-hover:text-blue-500" />
                </button>
                <button type="button" onClick={openModal} className="group">
                  <ChartNoAxesCombined className="w-8 h-8 group-hover:text-blue-500" />
                </button>
              </div>
            </SidebarGroupContent>

            <SidebarGroupContent>
              <strong className="block my-1 text-xs">영역</strong>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={openModal} className="group">
                  <ChartArea className="w-8 h-8 group-hover:text-blue-500" />
                </button>
              </div>
            </SidebarGroupContent>
            
            <SidebarGroupContent>
              <strong className="block my-1 text-xs">열</strong>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={openModal} className="group">
                  <ChartColumnBig className="w-8 h-8 group-hover:text-blue-500" />
                </button>
                <button type="button" onClick={openModal} className="group">
                  <ChartColumnStacked className="w-8 h-8 group-hover:text-blue-500" />
                </button>
              </div>
            </SidebarGroupContent>
            
            <SidebarGroupContent>
              <strong className="block my-1 text-xs">막대</strong>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={openModal} className="group">
                  <ChartBarBig className="w-8 h-8 group-hover:text-blue-500" />
                </button>
                <button type="button" onClick={openModal} className="group">
                  <ChartBarStacked className="w-8 h-8 group-hover:text-blue-500" />
                </button>
              </div>
            </SidebarGroupContent>
            
            <SidebarGroupContent>
              <strong className="block my-1 text-xs">원형</strong>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={openModal} className="group">
                  <ChartPie className="w-8 h-8 group-hover:text-blue-500" />
                </button>
                <button type="button" onClick={openModal} className="group">
                  <TbChartDonut className="w-8 h-8 group-hover:text-blue-500" />
                </button>
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {isModalOpen && <ESGChartDialog open={isModalOpen} setOpen={setIsModalOpen} />}
    </>
  );
} 