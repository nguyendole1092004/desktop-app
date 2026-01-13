import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initTables } from "./services/db"; // Import hàm tạo bảng

// Chạy khởi tạo bảng trước rồi mới mở App
initTables().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch(err => {
  console.error("Lỗi khởi tạo DB:", err);
});