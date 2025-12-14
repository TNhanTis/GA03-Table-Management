import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // 1. Tạo state để lưu dữ liệu từ backend
  const [data, setData] = useState(null);

  // 2. Dùng useEffect để gọi API khi trang vừa tải xong
  useEffect(() => {
    // Hàm gọi API
    const fetchData = async () => {
      try {
        // Gọi đến cổng 3000 của NestJS
        const response = await fetch("http://localhost:3000");

        // Chuyển kết quả về dạng JSON
        const result = await response.json();

        // Lưu vào state
        setData(result);
        console.log("Dữ liệu nhận được:", result);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchData();
  }, []); // [] rỗng nghĩa là chỉ chạy 1 lần khi component mount

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>React JS + NestJS</h1>

      <div className="card">
        {/* 3. Hiển thị dữ liệu */}
        {data ? (
          <div
            style={{
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ color: "green" }}>{data.message}</h2>
            <p>Status: {data.status}</p>
            <p>Time: {data.timestamp}</p>
          </div>
        ) : (
          <p>Đang tải dữ liệu từ Backend...</p>
        )}
      </div>
    </div>
  );
}

export default App;
