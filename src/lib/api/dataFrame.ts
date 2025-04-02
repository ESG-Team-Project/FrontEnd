"use client";

export class DataFrame {
    file: File;
    data: Map<number, Record<number, string>>;

    constructor(file: File) {
        this.file = file;
        this.data = new Map();
        
    }

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const csvText = reader.result as string;
                const rows = csvText.split("\n").map(row => row.trim());

                rows.forEach((row, rowIndex) => {
                    const columns = row.split(",");
                    const rowObject: Record<number, string> = {};

                    columns.forEach((value, colIndex) => {
                        rowObject[colIndex] = value;
                    });

                    this.data.set(rowIndex, rowObject);
                });

                console.log("CSV 데이터 파싱 완료:", this.data);
                resolve();
            };

            reader.onerror = reject;
            reader.readAsText(this.file);
        });
    }

    // ✅ loc() 메서드 추가
    loc(rowOrRange: number | [number, number], colOrRange: number | [number, number]) {
        if (typeof rowOrRange === "number" && typeof colOrRange === "number") {
            // 🎯 특정 행, 특정 열 값 반환
            return this.data.get(rowOrRange)?.[colOrRange];
        } else if (Array.isArray(rowOrRange) && Array.isArray(colOrRange)) {
            // 🎯 범위 슬라이싱 (행 범위와 열 범위)
            const [rowStart, rowEnd] = rowOrRange;
            const [colStart, colEnd] = colOrRange;
            const slicedData: Record<number, Record<number, string>> = {};

            for (let i = rowStart; i <= rowEnd; i++) {
                const row = this.data.get(i);
                if (row) {
                    slicedData[i] = Object.fromEntries(
                        Object.entries(row)
                            .map(([colKey, value]) => [Number(colKey), value])
                            .filter(([colKey]) => Number(colKey) >= colStart && Number(colKey) <= colEnd)
                    );
                }
            }
            return slicedData;
        }
    }
}
