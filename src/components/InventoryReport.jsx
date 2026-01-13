import React from "react";

export default function InventoryReport({ products }) {
  // Tính toán số liệu tổng quát
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price_import), 0);

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50' }}>📊 BÁO CÁO TỒN KHO</h2>
      
      {/* Thẻ tóm tắt */}
      <div style={summaryGrid}>
        <div style={cardStyle}>
          <small>Tổng số lượng tồn</small>
          <div style={valueStyle}>{totalItems} cái</div>
        </div>
        <div style={cardStyle}>
          <small>Tổng vốn tồn kho</small>
          <div style={{...valueStyle, color: '#e67e22'}}>{totalValue.toLocaleString()}₫</div>
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th>Tên Sản Phẩm</th>
            <th>Hãng</th>
            <th style={{ textAlign: 'center' }}>Số Lượng Tồn</th>
            <th>Giá Nhập Avg</th>
            <th>Thành Tiền (Vốn)</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={trStyle}>
              <td style={{ fontWeight: 'bold' }}>{p.name}</td>
              <td>{p.brand}</td>
              <td style={{ textAlign: 'center' }}>
                <span style={p.stock < 5 ? lowStockLabel : {}}>{p.stock}</span>
              </td>
              <td>{p.price_import.toLocaleString()}₫</td>
              <td style={{ fontWeight: 'bold' }}>{(p.stock * p.price_import).toLocaleString()}₫</td>
              <td>
                {p.stock === 0 ? (
                  <span style={tagRed}>Hết hàng</span>
                ) : p.stock < 5 ? (
                  <span style={tagYellow}>Sắp hết</span>
                ) : (
                  <span style={tagGreen}>Ổn định</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Styles cho báo cáo ---
const containerStyle = { padding: '20px', background: '#fff', borderRadius: '12px' };
const summaryGrid = { display: 'flex', gap: '20px', marginBottom: '25px' };
const cardStyle = { flex: 1, padding: '20px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '5px solid #3498db' };
const valueStyle = { fontSize: '24px', fontWeight: 'bold', marginTop: '5px' };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadStyle = { background: "#f1f2f6", textAlign: "left" };
const trStyle = { borderBottom: "1px solid #eee" };
const lowStockLabel = { color: 'red', fontWeight: 'bold' };
const tagRed = { background: '#ff7675', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' };
const tagYellow = { background: '#ffeaa7', color: '#d35400', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' };
const tagGreen = { background: '#55efc4', color: '#00b894', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' };