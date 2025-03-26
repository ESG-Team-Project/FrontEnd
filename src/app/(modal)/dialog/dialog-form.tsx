import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ESGChartDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-lg p-6 bg-white dark:bg-gray-900 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            ESG 차트 1
          </DialogTitle>
        </DialogHeader>
        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">차트 제목</span>
            <span className="font-medium">ESG 차트 1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">ESG 항목</span>
            <span className="font-medium">
              201-4 → 국가별 정부의 재정지원 금액
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="default">다음</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
