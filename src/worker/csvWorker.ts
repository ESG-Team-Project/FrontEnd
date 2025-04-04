import Papa from 'papaparse';

self.onmessage = event => {
  const file = event.data;
  console.log('Received file:', file);
  Papa.parse(file, {
    worker: true, // Web Worker에서 처리
    header: true, // CSV의 첫 줄을 헤더로 사용
    skipEmptyLines: true, // 빈 줄 제거
    complete: result => {
      self.postMessage(result.data); // 파싱된 데이터 반환
    },
  });
};
