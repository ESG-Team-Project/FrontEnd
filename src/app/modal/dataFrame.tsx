'use client'    

  export default function DataTable(file:File) {
    const test = file.arrayBuffer().then((buffer) => {
      const arrayBuffer = buffer as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder().decode(uint8Array);
      return text.split('\n').map(row => row.split(','));
    })
   return test
  }
