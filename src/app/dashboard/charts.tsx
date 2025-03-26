import React from "react";

export default function Charts() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#eaeaea",
        height: "100vh",
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#00b475",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "150px", // Adjust height as needed
          }}
        >
          네모칸 {index + 1}
        </div>
      ))}
    </div>
  );
}
