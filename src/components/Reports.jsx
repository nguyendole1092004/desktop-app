import React, { useState, useEffect } from "react";
import { getDb } from "../services/db";
import * as XLSX from "xlsx";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Reports({ products }) {
  // 1. Thêm State để lưu khoảng ngày lọc
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    topSalesData: { labels: [], datasets: [] }
  });

  useEffect(() => {
    calculateReport();
  }, [products, fromDate, toDate]); // Chạy lại khi đổi ngày

  const calculateReport = async () => {
    try {
      const db = await getDb();
      
      // 2. Sửa SQL để lọc theo thời gian (strftime giúp định dạng lại ngày từ logs)
      // Giả sử cột created_at trong bảng logs lưu dạng YYYY-MM-DD HH:MM:SS
      const salesLogs = await db.select(`
        SELECT l.quantity, p.name, p.price_export
        FROM logs l
        JOIN products p ON l.product_id = p.id
        WHERE l.action_type = 'EXPORT'
        AND date(l.created_at) BETWEEN $1 AND $2
      `, [fromDate, toDate]);

      let revenue = 0;
      const productSales = {};

      salesLogs.forEach(log => {
        revenue += (log.quantity * log.price_export);
        productSales[log.name] = (productSales[log.name] || 0) + log.quantity;
      });

      const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      setStats({
        totalRevenue: revenue,
        totalOrders: salesLogs.length,
        topSalesData: {
          labels: topProducts.length > 0 ? topProducts.map(p => p[0]) : ["Không có dữ liệu"],
          datasets: [{
            label: 'Số lượng bán',
            data: topProducts.length > 0 ? topProducts.map(p => p[1]) : [0],
            backgroundColor: '#3498db',
            borderRadius: 5
          }]
        }
      });
    } catch (err) {
      console.error("Lỗi tính toán báo cáo:", err);
    }
  };

  const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price_import), 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const exportToExcel = async () => {
    try {
      const now = new Date();
      const fileName = `Bao_Cao_${fromDate}_den_${toDate}_${now.getHours()}h${now.getMinutes()}.xlsx`;

      const data = products.map(p => ({
        "Tên sản phẩm": p.name,
        "Tồn Kho": p.stock,
        "Giá Nhập": p.price_import,
        "Giá Bán": p.price_export,
        "Giá Trị Tồn": p.stock * p.price_import
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const path = await save({
        filters: [{ name: 'Excel', extensions: ['xlsx'] }],
        defaultPath: fileName
      });

      if (path) {
        await writeFile(path, new Uint8Array(excelBuffer));
        alert("Đã xuất file thành công!");
      }
    } catch (error) {
      alert("Lỗi xuất file!");
    }
  };

  return (
    <div style={container}>
      {/* THANH BỘ LỌC NGÀY */}
      <div style={filterBar}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={miniLabel}>TỪ NGÀY:</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={dateInput} />
          </div>
          <div>
            <label style={miniLabel}>ĐẾN NGÀY:</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={dateInput} />
          </div>
          <button onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setFromDate(today); setToDate(today);
          }} style={btnToday}>Hôm nay</button>
        </div>
        <button onClick={exportToExcel} style={btnExcel}>📥 Xuất Excel Tồn Kho</button>
      </div>

      <div style={statsGrid}>
        <div style={{ ...card, borderLeft: '5px solid #2ecc71' }}>
          <small style={label}>DOANH THU KỲ NÀY</small>
          <div style={value}>{stats.totalRevenue.toLocaleString()}₫</div>
        </div>
        <div style={{ ...card, borderLeft: '5px solid #e67e22' }}>
          <small style={label}>VỐN TỒN KHO HIỆN TẠI</small>
          <div style={value}>{inventoryValue.toLocaleString()}₫</div>
        </div>
        <div style={{ ...card, borderLeft: '5px solid #3498db' }}>
          <small style={label}>TỔNG MẶT HÀNG</small>
          <div style={value}>{totalStock}</div>
        </div>
        <div style={{ ...card, borderLeft: '5px solid #9b59b6' }}>
          <small style={label}>ĐƠN HÀNG KỲ NÀY</small>
          <div style={value}>{stats.totalOrders}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div style={chartCard}>
          <h4 style={{marginTop: 0}}>🔥 Top sản phẩm bán chạy (theo kỳ)</h4>
          <div style={{ height: '250px' }}>
            <Bar data={stats.topSalesData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div style={chartCard}>
          <h4 style={{marginTop: 0}}>📦 Tỷ trọng tồn kho (hiện tại)</h4>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            <Pie 
              data={{
                labels: products.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: products.slice(0, 5).map(p => p.stock),
                  backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
                }]
              }} 
              options={{ maintainAspectRatio: false }} 
            />
          </div>
        </div>
      </div>
      
      {/* ... Phần Bảng cảnh báo giữ nguyên ... */}
    </div>
  );
}

// --- Styles bổ sung ---
const filterBar = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'flex-end', 
  background: '#fff', 
  padding: '15px 20px', 
  borderRadius: '12px', 
  marginBottom: '25px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};
const miniLabel = { display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#95a5a6', marginBottom: '5px' };
const dateInput = { padding: '8px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', color: '#2c3e50' };
const btnToday = { padding: '8px 15px', background: '#34495e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };

// Các style cũ giữ nguyên...
const container = { padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const card = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const chartCard = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const label = { color: '#95a5a6', fontWeight: 'bold', fontSize: '11px' };
const value = { fontSize: '22px', fontWeight: 'bold', marginTop: '8px', color: '#2c3e50' };
const btnExcel = { padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };