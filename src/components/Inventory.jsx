import React, { useState, useEffect } from "react";
import { getDb } from "../services/db";
import { open } from "@tauri-apps/plugin-dialog";

export default function Inventory({ refreshData }) {
  // 1. Trạng thái quản lý phiếu nhập
  const [suppliers, setSuppliers] = useState([]);
  const [isInvoiceCreated, setIsInvoiceCreated] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");

  // 2. Trạng thái form sản phẩm
  const [form, setForm] = useState({
    name: "", brand: "", category: "Điện thoại",
    price_import: "", price_export: "", stock: "", specs: "", image_url: ""
  });

  const categories = ["Điện thoại", "Laptop", "Đồng hồ", "PC", "Màn hình", "Linh kiện", "Chuột/Bàn phím"];

  // Lấy danh sách NCC khi mở trang
  useEffect(() => {
    const fetchSuppliers = async () => {
      const db = await getDb();
      const res = await db.select("SELECT * FROM suppliers ORDER BY name ASC");
      setSuppliers(res);
    };
    fetchSuppliers();
  }, []);

  const pickImage = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
    });
    if (selected) setForm({ ...form, image_url: selected });
  };

  // Bước 1: Khởi tạo phiếu nhập
  const handleCreateInvoice = () => {
    if (!selectedSupplier) return alert("Vui lòng chọn Nhà cung cấp trước khi tạo phiếu!");
    setIsInvoiceCreated(true);
  };

  // Bước 2: Xác nhận lưu sản phẩm vào kho
  const handleAdd = async () => {
    if (!form.name || !form.price_import || !form.price_export || !form.stock) {
      return alert("Vui lòng nhập đủ thông tin sản phẩm!");
    }

    try {
      const db = await getDb();
      
      // Thêm sản phẩm vào bảng products
      await db.execute(
        "INSERT INTO products (name, brand, category, specs, price_import, price_export, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          form.name, form.brand, form.category, form.specs,
          parseFloat(form.price_import) || 0,
          parseFloat(form.price_export) || 0,
          parseInt(form.stock) || 0,
          form.image_url
        ]
      );

      // Ghi lịch sử nhập kho vào bảng stock_history (Theo cấu trúc 8 bảng)
      // Tìm ID sản phẩm vừa tạo (SQLite)
      const lastProd = await db.select("SELECT id FROM products ORDER BY id DESC LIMIT 1");
      const productId = lastProd[0].id;

      const ncc = suppliers.find(s => s.id == selectedSupplier);
      await db.execute(
        "INSERT INTO stock_history (product_id, type, quantity, note) VALUES ($1, $2, $3, $4)",
        [productId, 'IMPORT', parseInt(form.stock), `Nhập từ NCC: ${ncc.name}. Ghi chú: ${invoiceNote}`]
      );

      alert("🎉 Đã nhập kho và ghi nhận phiếu nhập thành công!");

      // Reset toàn bộ
      setForm({ name: "", brand: "", category: "Điện thoại", price_import: "", price_export: "", stock: "", specs: "", image_url: "" });
      setIsInvoiceCreated(false);
      setSelectedSupplier("");
      setInvoiceNote("");
      if (refreshData) refreshData();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi lưu kho!");
    }
  };

  return (
    <div style={container}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>📦 QUY TRÌNH NHẬP KHO</h2>

      {/* GIAI ĐOẠN 1: CHỌN NHÀ CUNG CẤP & TẠO PHIẾU */}
      {!isInvoiceCreated ? (
        <div style={stepBox}>
          <h4 style={{marginTop: 0}}>BƯỚC 1: THIẾT LẬP PHIẾU NHẬP</h4>
          <label style={labelStyle}>Chọn Nhà cung cấp đối tác</label>
          <select 
            value={selectedSupplier} 
            onChange={e => setSelectedSupplier(e.target.value)} 
            style={inputStyle}
          >
            <option value="">-- Chọn Nhà cung cấp --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>)}
          </select>

          <label style={{...labelStyle, marginTop: '15px'}}>Ghi chú nhập kho (Số hóa đơn, đợt nhập...)</label>
          <textarea 
            value={invoiceNote} 
            onChange={e => setInvoiceNote(e.target.value)} 
            style={{...inputStyle, height: '60px', resize: 'none'}}
            placeholder="Ví dụ: Nhập hàng đợt tháng 1/2026..."
          />
          
          <button onClick={handleCreateInvoice} style={btnStart}>TẠO PHIẾU & BẮT ĐẦU NHẬP HÀNG</button>
        </div>
      ) : (
        /* GIAI ĐOẠN 2: NHẬP CHI TIẾT HÀNG HÓA */
        <div style={stepBoxActive}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <h4 style={{marginTop: 0, color: '#27ae60'}}>BƯỚC 2: KHAI BÁO CHI TIẾT HÀNG HÓA</h4>
            <button onClick={() => setIsInvoiceCreated(false)} style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer'}}>Hủy phiếu</button>
          </div>
          
          <p style={{fontSize: '12px', color: '#7f8c8d'}}>
            Đang tạo phiếu nhập cho: <b>{suppliers.find(s => s.id == selectedSupplier)?.name}</b>
          </p>

          <div style={grid}>
            <div style={inputGroup}>
              <label style={labelStyle}>Tên sản phẩm</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Loại sản phẩm</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Hãng sản xuất</label>
              <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Cấu hình (Specs)</label>
              <input placeholder="RAM, CPU..." value={form.specs} onChange={e => setForm({ ...form, specs: e.target.value })} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Giá Nhập (Vốn)</label>
              <input type="number" value={form.price_import} onChange={e => setForm({ ...form, price_import: e.target.value })} style={{ ...inputStyle, borderColor: '#e67e22' }} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Giá Bán (Niêm yết)</label>
              <input type="number" value={form.price_export} onChange={e => setForm({ ...form, price_export: e.target.value })} style={{ ...inputStyle, borderColor: '#27ae60' }} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Số lượng nhập</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{...inputStyle, fontWeight: 'bold'}} />
            </div>
            <div style={inputGroup}>
                <label style={labelStyle}>Ảnh sản phẩm</label>
                <button onClick={pickImage} style={btnImage}>📸 {form.image_url ? "Đã chọn ảnh" : "Chọn tệp ảnh"}</button>
            </div>
          </div>

          <button onClick={handleAdd} style={btnSubmit}>HOÀN TẤT NHẬP KHO & LƯU PHIẾU</button>
        </div>
      )}
    </div>
  );
}

// --- CSS STYLES ---
const container = { background: "#f8f9fa", padding: "20px", borderRadius: "15px", maxWidth: '900px', margin: '0 auto' };
const stepBox = { background: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: 'flex', flexDirection: 'column' };
const stepBoxActive = { background: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 20px rgba(39, 174, 96, 0.2)", border: '1px solid #27ae60' };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: '15px' };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#666' };
const inputStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", outline: 'none' };
const btnStart = { marginTop: '20px', padding: '15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const btnImage = { padding: "10px", background: "#eee", border: "1px dashed #999", borderRadius: "6px", cursor: "pointer", fontSize: '13px' };
const btnSubmit = { width: "100%", marginTop: "25px", padding: "15px", background: "#27ae60", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" };