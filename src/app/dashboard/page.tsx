import React from "react";
import Mainframe from "./mainframe";
import Charts from "./charts";

export default function Page() {
  return (
    <div
      style={{
        backgroundColor: "rgba(0,180,117,0.2)", //#00b475",
        height: "100vh", // 화면 전체 높이
        display: "flex", // 텍스트를 중앙 정렬하기 위해 flex 사용
        justifyContent: "center", // 가로 중앙 정렬
        alignItems: "center", // 세로 중앙 정렬
        color: "#fff", // 텍스트 색상 (가독성을 위해 흰색)
        fontSize: "50px", // 텍스트 크기
        fontWeight: "bold", // 텍스트 굵기
      }}
    >
      으아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아아앙아아아아아아
    </div>
  );
}
