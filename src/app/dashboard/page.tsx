'use client';

import React, { useState } from 'react';
import { ChartAreaInteractive } from '@/components/chartarea-interactive';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
// import CustomSidebar from '@/components/customsidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardHeader from './dashboard-header';

type Props = {
  companyName: string;
  managerName: string;
};

export default function Page() {
  return (
    <>
      <div className="flex flex-row w-full">
        <DashboardHeader />
        </div>
    </>
  );
}
