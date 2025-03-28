import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  const [locked, setLocked] = useState(false);

  return (
    <div className="flex flex-row justify-end w-full px-4 py-3 border-b bg-gray-50">
      <div className="flex items-center m-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <span>레이아웃 잠금</span>
          <Switch checked={locked} onCheckedChange={setLocked} />
        </label>
      </div>
      <Button variant="outline" className="bg-white">
        파일 선택
      </Button>
    </div>
  );
}
