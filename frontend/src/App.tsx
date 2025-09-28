import React from "react";
import { useEffect, useState } from "react";

interface Vegetable {
  ID: number;
  Name: string;
  Quantity: number;
}

function App() {
  const [data, setData] = useState<Vegetable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/vegetables") 
      .then((res) => res.json())
      .then((data: Vegetable[]) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách rau củ</h1>
      {data.length === 0 ? (
        <p>Không có dữ liệu</p>
      ) : (
        <ul>
          {data.map((item) => (
            <li key={item.ID}>
              {item.Name} - Số lượng: {item.Quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
