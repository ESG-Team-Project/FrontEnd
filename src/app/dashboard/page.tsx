'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import DashboardHeader from './dashboard-header';
import { LineChart, BarChart, PieChart } from 'lucide-react';

export default function Page() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-col justify-center w-full gap-4 min-h-auto md:p-4 bg-(--color-background)">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* 예시 카드 */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="w-5 h-5 mr-2" />
                분석 대시보드
              </CardTitle>
              <CardDescription>데이터를 시각화하여 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                차트를 추가하려면 좌측 사이드바의 '차트 추가' 메뉴를 이용하세요.
              </p>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                진행 상황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">환경 점수</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">사회 점수</span>
                    <span className="text-sm font-medium">63%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '63%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">지배구조 점수</span>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                주요 지표
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">탄소 배출량</span>
                  <span className="text-sm font-medium">84.2 tCO2</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">에너지 사용량</span>
                  <span className="text-sm font-medium">425.7 MWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">재활용률</span>
                  <span className="text-sm font-medium">68.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
