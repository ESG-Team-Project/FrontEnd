'use client'

import React, { useState } from 'react'
import { ChartAreaInteractive } from '@/components/chartarea-interactive'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

type Props = {
	companyName: string
	managerName: string
}

export default function Page({ companyName, managerName }: Props) {
  return (
<div className="flex flex-col justify-center w-full gap-4 min-h-auto md:p-4 bg-(--color-background) ">
			<div className="flex flex-row justify-center w-full min-h-auto">
				<Card className="flex w-full">
					<CardContent>
						<form>
							<p className="pb-2">회사명: {companyName} </p>
							<p>담당자 이름: {managerName} </p>
						</form>
					</CardContent>
				</Card>
			</div>
			<div className="grid flex-wrap w-full grid-flow-col gap-4 overflow-hidden bg-amber-950">
					<ChartAreaInteractive label="Title" />
          <ChartAreaInteractive label="Title" />
          <ChartAreaInteractive label="Title" />
          <ChartAreaInteractive label="Title" />
          <Card className='w-20'>
            <CardContent>
              dfdg
            </CardContent>
          </Card>
          <Card className='w-20'>
            <CardContent>
              dfdg
            </CardContent>
          </Card>
          <Card className='w-20'>
            <CardContent>
              dfdg
            </CardContent>
          </Card>
			</div>
		</div>
  )
}
