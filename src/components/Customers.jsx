import React, { useState, useEffect } from "react";
import { getDb } from "../services/db"; // Import từ dịch vụ DB của bạn

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "" });

  // Load danh sách khách hàng dùng SQL trực tiếp
  const fetchCustomers = async () => {
    try {
      const db = await getDb();
      const res = await db.select(
        "SELECT * FROM customers WHERE name LIKE $1 OR phone LIKE $1 ORDER BY id DESC",
        [`%${searchTerm}%`]
      );
      setCustomers(res);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]); // Tự động tìm kiếm khi gõ

  const handleAddCustomer = async () => {
    if (!newCust.name || !newCust.phone) return alert("Vui lòng nhập đủ thông tin!");
    try {
      const db = await getDb();
      await db.execute(
        "INSERT INTO customers (name, phone, points) VALUES ($1, $2, $3)",
        [newCust.name, newCust.phone, 0]
      );
      setShowModal(false);
      setNewCust({ name: "", phone: "" });
      fetchCustomers();
    } catch (err) {
      alert("Số điện thoại có thể đã tồn tại!");
      console.error(err);
    }
  };

  return (
    <div style={{ color: "#2c3e50" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>👥 Quản lý Khách hàng</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", background: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          + Thêm khách hàng
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm tên hoặc số điện thoại khách hàng..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
      />

      <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#34495e", color: "white", textAlign: "left" }}>
              <th style={{ padding: "15px" }}>ID</th>
              <th style={{ padding: "15px" }}>Tên khách hàng</th>
              <th style={{ padding: "15px" }}>Số điện thoại</th>
              <th style={{ padding: "15px" }}>Điểm tích lũy</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? customers.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px" }}>{c.id}</td>
                <td style={{ padding: "15px", fontWeight: "bold" }}>{c.name}</td>
                <td style={{ padding: "15px" }}>{c.phone}</td>
                <td style={{ padding: "15px" }}>
                   <span style={{ background: "#f1c40f", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                     ⭐ {c.points || 0}
                   </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#95a5a6" }}>Không tìm thấy khách hàng nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Khách Hàng */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginTop: 0 }}>Thêm khách hàng mới</h3>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Họ và tên</label>
            <input 
              type="text" 
              value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})}
              style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ddd" }}
            />
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Số điện thoại</label>
            <input 
              type="text" 
              value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})}
              style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #ddd" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleAddCustomer} style={{ flex: 1, padding: "12px", background: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Lưu lại</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", background: "#bdc3c7", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}