import React, { useEffect, useState } from "react";
import { getDb } from "../services/db";

export default function History() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const db = await getDb();
    // JOIN hai bảng để lấy tên sản phẩm thay vì chỉ lấy ID
    const res = await db.select(`
      SELECT logs.*, products.name 
      FROM logs 
      JOIN products ON logs.product_id = products.id 
      ORDER BY logs.created_at DESC 
      LIMIT 50
    `);
    setLogs(res);
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <h3>📜 Nhật ký Nhập / Xuất kho</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={padding}>Thời gian</th>
            <th style={padding}>Sản phẩm</th>
            <th style={padding}>Hành động</th>
            <th style={padding}>Số lượng</th>
            <th style={padding}>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={padding}>{new Date(log.created_at).toLocaleString()}</td>
              <td style={padding}><b>{log.name}</b></td>
              <td style={padding}>
                <span style={{ 
                  color: log.action_type === 'IMPORT' ? 'green' : 'red',
                  fontWeight: 'bold' 
                }}>
                  {log.action_type === 'IMPORT' ? '📥 NHẬP' : '📤 XUẤT'}
                </span>
              </td>
              <td style={padding}>{log.quantity}</td>
              <td style={padding}>{log.note || "---"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const padding = { padding: '12px' };