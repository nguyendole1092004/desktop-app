import React, { useState, useEffect } from "react";
import { getDb } from "../services/db";
import { open } from "@tauri-apps/plugin-dialog"; 
import { convertFileSrc } from "@tauri-apps/api/core"; 

export default function EditProductModal({ product, onClose, refreshData }) {
  const [form, setForm] = useState({ ...product });
  const [suppliers, setSuppliers] = useState([]); // Lưu danh sách NCC

  // 1. Tải danh sách nhà cung cấp khi mở Modal
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const db = await getDb();
        const res = await db.select("SELECT id, name FROM suppliers ORDER BY name ASC");
        setSuppliers(res);
      } catch (err) {
        console.error("Lỗi tải NCC:", err);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSelectImage = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Hình ảnh', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
      });
      if (selected) setForm({ ...form, image_url: selected });
    } catch (err) {
      console.error("Lỗi chọn ảnh:", err);
    }
  };

  const handleUpdate = async () => {
    if (!form.name) return alert("Tên sản phẩm không được để trống!");

    try {
      const db = await getDb();
      // Cập nhật bảng products
      await db.execute(
        `UPDATE products 
         SET name = $1, brand = $2, category = $3, specs = $4, 
             price_import = $5, price_export = $6, stock = $7,
             image_url = $8 
         WHERE id = $9`,
        [
          form.name, form.brand, form.category, form.specs,
          parseFloat(form.price_import) || 0, 
          parseFloat(form.price_export) || 0,
          parseInt(form.stock) || 0, 
          form.image_url, 
          form.id
        ]
      );
      
      // Nếu có thay đổi nhà cung cấp hoặc số lượng, ta ghi vào stock_history
      // note sẽ lưu tên nhà cung cấp để đồng bộ với hàm fetchData ở App.jsx
      if (form.supplier_name !== product.supplier_name || form.stock !== product.stock) {
        await db.execute(
          "INSERT INTO stock_history (product_id, type, quantity, note) VALUES ($1, $2, $3, $4)",
          [
            form.id, 
            'IMPORT', 
            form.stock, 
            `Cập nhật từ Modal - NCC: ${form.supplier_name || 'Không xác định'}`
          ]
        );
      }

      alert("✅ Đã cập nhật thành công!");
      refreshData();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật DB!");
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>📝 Chỉnh sửa sản phẩm #{form.id}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        
        <div style={mainLayout}>
          <div style={imageSection}>
            <img 
              src={form.image_url ? convertFileSrc(form.image_url) : "https://via.placeholder.com/150?text=No+Image"} 
              style={previewImg} 
              alt="Preview" 
            />
            <button type="button" onClick={handleSelectImage} style={btnImage}>Đổi ảnh</button>
          </div>

          <div style={grid}>
            <div style={inputGroup}>
              <label style={labelStyle}>Tên sản phẩm</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{...inputGroup, flex: 1}}>
                <label style={labelStyle}>Hãng / Thương hiệu</label>
                <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} style={inputStyle} />
              </div>
              
              {/* PHẦN CHỌN NHÀ CUNG CẤP MỚI */}
              <div style={{...inputGroup, flex: 1}}>
                <label style={labelStyle}>Nhà cung cấp</label>
                <select 
                  value={form.supplier_name || ""} 
                  onChange={e => setForm({...form, supplier_name: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">-- Chọn NCC --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{...inputGroup, flex: 1}}>
                    <label style={labelStyle}>Phân loại</label>
                    <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle} />
                </div>
                <div style={{...inputGroup, flex: 1}}>
                    <label style={labelStyle}>Số lượng tồn</label>
                    <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={{...inputStyle, fontWeight: 'bold'}} />
                </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Cấu hình / Mô tả</label>
              <textarea 
                value={form.specs} 
                onChange={e => setForm({...form, specs: e.target.value})} 
                style={{...inputStyle, height: '50px', resize: 'none'}} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
              <div style={{...inputGroup, flex: 1}}>
                <label style={{...labelStyle, color: '#e67e22'}}>Giá nhập</label>
                <input type="number" value={form.price_import} onChange={e => setForm({...form, price_import: e.target.value})} style={inputStyle} />
              </div>
              <div style={{...inputGroup, flex: 1}}>
                <label style={{...labelStyle, color: '#27ae60'}}>Giá bán</label>
                <input type="number" value={form.price_export} onChange={e => setForm({...form, price_export: e.target.value})} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
          <button onClick={handleUpdate} style={btnSave}>LƯU THAY ĐỔI</button>
          <button onClick={onClose} style={btnCancel}>HỦY BỎ</button>
        </div>
      </div>
    </div>
  );
}

// ... Styles giữ nguyên như cũ
const mainLayout = { display: 'flex', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#7f8c8d', textTransform: 'uppercase' };
const imageSection = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '15px', background: '#fdfdfd', border: '1px solid #eee', borderRadius: '10px' };
const previewImg = { width: '130px', height: '130px', objectFit: 'contain', borderRadius: '8px' };
const grid = { flex: 2, display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' };
const btnImage = { padding: '6px 10px', fontSize: '11px', cursor: 'pointer', background: '#f0f2f5', color: '#555', border: '1px solid #ccc', borderRadius: '5px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' };
const modalContent = { background: '#fff', padding: '25px', borderRadius: '15px', width: '680px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const btnSave = { flex: 2, padding: '14px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancel = { flex: 1, padding: '14px', background: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '8px', cursor: 'pointer' };