import Papa from 'papaparse';
import { ChartType, ChartData } from '@/types/chart'; // ChartType과 ChartData 타입 임포트
self.onmessage = event => {
  const file = event.data;
  console.log('Received file:', file);
  Papa.parse(file, {
    worker: true, // Web Worker에서 처리
    header: false, // CSV의 첫 줄을 헤더로 사용
    skipEmptyLines: true, // 빈 줄 제거
    complete: result  => {
      const labels = Array.from({length: result.data.length}, (_, i) => i+1); // 1부터 시작하는 레이블 생성
      const dataset: ChartData['datasets'] = (result.data[0] as string[][]).map((_, colindex) => {
        return ({label:`${colindex+1}`,data:(result.data as string[][]).map(row => row[colindex])});
      });

      self.postMessage({labels:labels,datasets:dataset}); // 파싱된 데이터 반환
    },
  });
};
