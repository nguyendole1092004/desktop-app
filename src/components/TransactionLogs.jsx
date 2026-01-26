import React, { useEffect, useState } from "react";
import { getDb } from "../services/db";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const db = await getDb();
      
      // SỬA LỖI TẠI ĐÂY: 
      // 1. Đổi bảng 'logs' thành 'stock_history' (h)
      // 2. Lấy cột 'type' thay vì 'action_type'
      const res = await db.select(`
        SELECT 
          h.id, 
          h.product_id, 
          h.type, 
          h.quantity, 
          h.note, 
          h.created_at, 
          p.name as product_name
        FROM stock_history h
        JOIN products p ON h.product_id = p.id 
        ORDER BY h.created_at DESC 
        LIMIT 100
      `);
      
      setLogs(res);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>📜 Nhật ký Nhập / Xuất kho</h3>
        <button onClick={fetchLogs} style={refreshBtn}>Làm mới</button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</p>
      ) : (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Thời gian</th>
                <th style={thStyle}>Sản phẩm</th>
                <th style={thStyle}>Hành động</th>
                <th style={thStyle}>Số lượng</th>
                <th style={thStyle}>Ghi chú / Nhà cung cấp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} style={trStyle}>
                    <td style={tdStyle}>
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={tdStyle}>
                      <b>{log.product_name}</b>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#fff',
                        background: log.type === 'IMPORT' ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold' 
                      }}>
                        {log.type === 'IMPORT' ? '📥 NHẬP KHO' : '📤 XUẤT KHO'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <b style={{ color: log.type === 'IMPORT' ? '#27ae60' : '#e74c3c' }}>
                        {log.type === 'IMPORT' ? `+${log.quantity}` : `-${log.quantity}`}
                      </b>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: '#666', fontSize: '13px' }}>
                        {log.note || "---"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    Chưa có hoạt động nhập xuất nào được ghi lại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Giao diện (Styles) ---
const containerStyle = { 
  padding: '20px', 
  background: '#fff', 
  borderRadius: '12px', 
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)' 
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const refreshBtn = {
  padding: '6px 12px',
  background: '#f0f0f0',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer'
};

const tableWrapper = {
  overflowX: 'auto'
};

const tableStyle = { 
  width: '100%', 
  borderCollapse: 'collapse',
  fontSize: '14px'
};

const theadRowStyle = { 
  background: '#f8f9fa', 
  textAlign: 'left',
  borderBottom: '2px solid #eee'
};

const thStyle = { padding: '15px 12px', color: '#555', fontWeight: '600' };
const tdStyle = { padding: '15px 12px', borderBottom: '1px solid #f0f0f0' };
const trStyle = { transition: 'background 0.2s' };