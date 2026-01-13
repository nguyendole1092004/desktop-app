import React, { useState, useEffect } from "react";
import { getDb } from "../services/db";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newSup, setNewSup] = useState({ name: "", phone: "", address: "" });

  // Load danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    try {
      const db = await getDb();
      const res = await db.select(
        "SELECT * FROM suppliers WHERE name LIKE $1 OR phone LIKE $1 ORDER BY id DESC",
        [`%${searchTerm}%`]
      );
      setSuppliers(res);
    } catch (err) {
      console.error("Lỗi lấy danh sách NCC:", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm]);

  const handleAddSupplier = async () => {
    if (!newSup.name) return alert("Vui lòng nhập tên nhà cung cấp!");
    try {
      const db = await getDb();
      await db.execute(
        "INSERT INTO suppliers (name, phone, address) VALUES ($1, $2, $3)",
        [newSup.name, newSup.phone, newSup.address]
      );
      setShowModal(false);
      setNewSup({ name: "", phone: "", address: "" });
      fetchSuppliers();
    } catch (err) {
      alert("Lỗi khi lưu nhà cung cấp!");
      console.error(err);
    }
  };

  return (
    <div style={{ color: "#2c3e50" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>🏢 Quản lý Nhà cung cấp</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", background: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          + Thêm nhà cung cấp
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm tên hoặc số điện thoại nhà cung cấp..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
      />

      <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#2c3e50", color: "white", textAlign: "left" }}>
              <th style={{ padding: "15px" }}>ID</th>
              <th style={{ padding: "15px" }}>Tên nhà cung cấp</th>
              <th style={{ padding: "15px" }}>Số điện thoại</th>
              <th style={{ padding: "15px" }}>Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? suppliers.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px" }}>{s.id}</td>
                <td style={{ padding: "15px", fontWeight: "bold" }}>{s.name}</td>
                <td style={{ padding: "15px" }}>{s.phone || "---"}</td>
                <td style={{ padding: "15px" }}>{s.address || "---"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#95a5a6" }}>Chưa có thông tin nhà cung cấp nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Nhà Cung Cấp */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginTop: 0 }}>Thêm nhà cung cấp mới</h3>
            
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Tên NCC *</label>
            <input 
              type="text" 
              value={newSup.name} onChange={e => setNewSup({...newSup, name: e.target.value})}
              style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ddd" }}
              placeholder="Ví dụ: Công ty ABC"
            />

            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Số điện thoại</label>
            <input 
              type="text" 
              value={newSup.phone} onChange={e => setNewSup({...newSup, phone: e.target.value})}
              style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ddd" }}
            />

            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Địa chỉ</label>
            <textarea 
              rows="3"
              value={newSup.address} onChange={e => setNewSup({...newSup, address: e.target.value})}
              style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #ddd", resize: "none" }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleAddSupplier} style={{ flex: 1, padding: "12px", background: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Lưu lại</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", background: "#bdc3c7", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}