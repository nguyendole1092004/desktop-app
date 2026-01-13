import React from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ask } from "@tauri-apps/plugin-dialog"; 
import { getDb } from "../services/db";

export default function ProductList({ products, onUpdateStock, searchTerm, setSearchTerm, refreshData, onEdit }) {

  const safeDelete = async (e, product) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      const confirmed = await ask(
        `Bạn có chắc chắn muốn xóa sản phẩm: ${product.name}?\nSản phẩm sẽ bị ẩn khỏi danh sách kinh doanh.`, 
        { 
          title: 'Xác nhận xóa', 
          kind: 'warning',
          okLabel: 'Đúng, xóa nó',
          cancelLabel: 'Bỏ qua'
        }
      );

      if (confirmed) {
        const db = await getDb();
        // SỬA LỖI 787: Thay DELETE bằng UPDATE is_active = 0
        await db.execute("UPDATE products SET is_active = 0 WHERE id = $1", [product.id]);
        
        // Sau khi update, tải lại dữ liệu để màn hình biến mất sản phẩm đó
        if (refreshData) await refreshData();
      }
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Không thể xóa sản phẩm này do ràng buộc dữ liệu.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerActionStyle}>
        <h2 style={{ marginBottom: '15px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📋 DANH MỤC HÀNG HÓA
        </h2>
        <input
          placeholder="🔍 Tìm theo tên, hãng hoặc loại hàng..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={thStyle}>Ảnh</th>
            <th style={thStyle}>Thông tin sản phẩm</th>
            <th style={thStyle}>Phân loại</th>
            <th style={thStyle}>Nhà cung cấp</th>
            <th style={thStyle}>Tồn</th>
            <th style={thStyle}>Giá Bán</th>
            <th style={thStyle}>Nhập/Xuất</th>
            <th style={thStyle}>Quản trị</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={trStyle}>
              <td style={{ padding: '10px' }}>
                <img
                  src={p.image_url ? convertFileSrc(p.image_url) : "https://placehold.jp/24/3498db/ffffff/50x50.png?text=NO+IMG"}
                  style={imgStyle}
                  alt="sp"
                  onError={(e) => { e.target.src = "https://placehold.jp/24/cccccc/ffffff/50x50.png?text=ERROR"; }}
                />
              </td>
              <td>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{p.brand}</div>
              </td>
              <td><span style={categoryBadge}>{p.category}</span></td>
              <td>
                <div style={supplierTextStyle}>
                  {p.supplier_name || "Chưa có dữ liệu"}
                </div>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span style={p.stock < 5 ? lowStockStyle : normalStockStyle}>
                  {p.stock}
                </span>
              </td>
              <td style={priceStyle}>{p.price_export?.toLocaleString()}₫</td>
              <td>
                <div style={actionGroup}>
                  <button onClick={() => onUpdateStock(p.id, 1, 'IMPORT', 'Nhập lẻ')} style={btnIn}>+</button>
                  <button
                    onClick={() => p.stock > 0 && onUpdateStock(p.id, 1, 'EXPORT', 'Xuất lẻ')}
                    style={{ ...btnOut, opacity: p.stock > 0 ? 1 : 0.5 }}
                  >
                    -
                  </button>
                </div>
              </td>
              <td>
                <div style={actionGroup}>
                  <button
                    type="button"
                    style={btnEdit}
                    onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                  >
                    📝
                  </button>
                  <button
                    type="button"
                    style={btnDelete}
                    onClick={(e) => safeDelete(e, p)}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- CSS Styles Giữ Nguyên ---
const supplierTextStyle = { fontSize: '13px', color: '#2980b9', fontWeight: '500', background: '#ebf5fb', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' };
const containerStyle = { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" };
const headerActionStyle = { marginBottom: "20px" };
const searchInputStyle = { width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #dfe6e9", fontSize: "15px", outline: 'none' };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadStyle = { background: "#f8f9fa", color: "#636e72", textAlign: "left" };
const thStyle = { padding: '15px 10px', fontWeight: '600' };
const trStyle = { borderBottom: "1px solid #f1f2f6" };
const imgStyle = { width: "45px", height: "45px", objectFit: "contain", borderRadius: '4px' };
const categoryBadge = { background: "#e1f5fe", color: "#0288d1", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 'bold' };
const priceStyle = { color: '#2ecc71', fontWeight: 'bold' };
const actionGroup = { display: 'flex', gap: '5px' };
const btnIn = { background: "#2ecc71", color: "white", border: "none", width: '28px', height: '28px', borderRadius: "4px", cursor: "pointer" };
const btnOut = { background: "#e74c3c", color: "white", border: "none", width: '28px', height: '28px', borderRadius: "4px", cursor: "pointer" };
const btnEdit = { background: "#f1f2f6", border: "none", width: '28px', height: '28px', borderRadius: "4px", cursor: "pointer" };
const btnDelete = { background: "#fff0f0", border: "none", width: '28px', height: '28px', borderRadius: "4px", cursor: "pointer" };
const lowStockStyle = { color: '#d63031', fontWeight: 'bold' };
const normalStockStyle = { fontWeight: 'bold' };