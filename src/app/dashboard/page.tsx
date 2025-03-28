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
    <DashboardHeader/>
    <div className="flex flex-col justify-center w-full gap-4 min-h-auto md:p-4 bg-(--color-background) ">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="w-full">
          <CardContent>dfdg</CardContent>
        </Card>
        <Card className="w-full">
          <CardContent>dfdg</CardContent>
        </Card>
        <Card className="w-full">
          <CardContent>dfdg</CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
