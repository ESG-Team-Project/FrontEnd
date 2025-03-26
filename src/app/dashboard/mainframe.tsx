import React from "react";

export default function Mainframe() {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f0f0",
        height: "20vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ color: "#555", fontSize: "24px", marginBottom: "10px" }}>
        회사명: 삼성전자
      </h1>
      <h2 style={{ color: "#555", fontSize: "24px" }}>담당자명: 김동환</h2>
    </div>
  );
}
