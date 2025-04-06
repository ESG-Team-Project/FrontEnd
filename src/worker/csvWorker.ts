import Papa from 'papaparse';
import type { ChartData } from '@/types/chart';

// CSV 파싱과 데이터 변환을 처리하는 Worker
self.onmessage = event => {
  const file = event.data;
  
  // 오류 핸들링을 위한 래퍼 함수
  try {
    parseCSV(file);
  } catch (error) {
    self.postMessage({ 
      error: true, 
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    });
  }
};

// CSV 파싱 함수
function parseCSV(file: File) {
  Papa.parse(file, {
    worker: true, // Web Worker에서 처리
    header: false, // CSV의 첫 줄을 헤더로 사용하지 않음
    skipEmptyLines: true, // 빈 줄 제거
    dynamicTyping: true, // 자동으로 타입 변환 시도
    error: (error) => {
      self.postMessage({ error: true, message: error.message });
    },
    complete: (result) => {
      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        self.postMessage({ error: true, message: '유효한 CSV 데이터가 없습니다.' });
        return;
      }

      try {
        // 데이터 유효성 검사
        const validData = validateAndCleanData(result.data);
        
        // 레이블 생성 (행 번호)
        const labels = Array.from({length: validData.length}, (_, i) => i+1);
        
        // 각 열에 대한 데이터셋 생성
        const datasets: ChartData['datasets'] = [];
        
        // 첫 행의 길이를 기준으로 열 개수 결정
        const columnCount = validData[0].length;
        
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
          const data = validData.map(row => {
            // 숫자 또는 문자열로 안전하게 변환
            const value = row[colIndex];
            if (typeof value === 'number') {
              return value;
            }
            
            if (typeof value === 'string') {
              const num = Number(value);
              return Number.isNaN(num) ? value : num; // 숫자로 변환 가능하면 숫자, 아니면 문자열 유지
            }
            
            return 0; // 기본값
          });
          
          datasets.push({
            label: `데이터셋 ${colIndex + 1}`,
            data: data
          });
        }
        
        // 결과 반환
        self.postMessage({ labels, datasets });
      } catch (error) {
        self.postMessage({ 
          error: true, 
          message: error instanceof Error ? error.message : 'CSV 데이터 처리 중 오류가 발생했습니다.'
        });
      }
    },
  });
}

// 데이터 유효성 검사 및 정제
function validateAndCleanData(data: any[][]): any[][] {
  if (data.length === 0) {
    throw new Error('빈 데이터입니다.');
  }
  
  // 모든 행의 길이 확인
  const rowLength = data[0].length;
  if (rowLength === 0) {
    throw new Error('데이터에 열이 없습니다.');
  }
  
  // 불균일한 행이 있는지 확인하고 정리
  return data.filter(row => {
    // 배열이 아니거나 빈 배열인 행 제외
    if (!Array.isArray(row) || row.length === 0) {
      return false;
    }
    
    // 길이가 다른 행은 패딩 추가
    while (row.length < rowLength) {
      row.push(0); // 부족한 열은 0으로 채움
    }
    
    return true;
  });
}
