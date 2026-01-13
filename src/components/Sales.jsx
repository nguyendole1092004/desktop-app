import React, { useState, useEffect } from "react";
import { ask } from "@tauri-apps/plugin-dialog";
import { getDb } from "../services/db";
import InvoiceModal from "./InvoiceModal";

export default function Sales({ products, onUpdateStock, user }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState({ cart: [], total: 0 });
  
  // Trạng thái mới: Khách hàng và Chi tiết sản phẩm
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [viewingProduct, setViewingProduct] = useState(null);

  // Load danh sách khách hàng để chọn
  useEffect(() => {
    const fetchCustomers = async () => {
      const db = await getDb();
      const res = await db.select("SELECT * FROM customers ORDER BY name ASC");
      setCustomers(res);
    };
    fetchCustomers();
  }, []);

  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.id.toString().includes(search)) && p.stock > 0
  );

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return alert("Hết hàng trong kho!");
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price_export * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const confirmPay = await ask(`Xác nhận thanh toán: ${totalAmount.toLocaleString()}₫?`, { title: 'Thanh toán', kind: 'info' });

    if (confirmPay) {
      try {
        const db = await getDb();
        // 1. Lưu vào bảng orders
        const orderRes = await db.execute(
          "INSERT INTO orders (customer_id, user_id, total_amount) VALUES ($1, $2, $3)",
          [selectedCustomerId || null, user.id, totalAmount]
        );
        const orderId = orderRes.lastInsertId;

        // 2. Lưu chi tiết hóa đơn và Trừ kho
        for (const item of cart) {
          await db.execute(
            "INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
            [orderId, item.id, item.quantity, item.price_export]
          );
          await onUpdateStock(item.id, item.quantity, 'EXPORT', `Hóa đơn #${orderId}`);
        }

        // 3. Cộng điểm cho khách (100.000đ = 1 điểm)
        if (selectedCustomerId) {
            const pointsToAdd = Math.floor(totalAmount / 100000);
            await db.execute("UPDATE customers SET points = points + $1 WHERE id = $2", [pointsToAdd, selectedCustomerId]);
        }

        setLastOrder({ cart: [...cart], total: totalAmount });
        setShowInvoice(true);
        setCart([]);
        setSelectedCustomerId("");
      } catch (err) { 
        console.error(err);
        alert("Lỗi khi xử lý giao dịch!"); 
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={productSection}>
        <div style={headerAction}>
          <input
            placeholder="🔍 Tìm sản phẩm..."
            style={searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            style={customerSelect} 
            value={selectedCustomerId} 
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">👤 Khách lẻ (Không tích điểm)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
            ))}
          </select>
        </div>

        <div style={tableContainer}>
          <table style={productTable}>
            <thead>
              <tr style={tableHeader}>
                <th>Mã</th>
                <th>Tên sản phẩm (Click xem chi tiết)</th>
                <th>Giá bán</th>
                <th>Tồn</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={tableRow}>
                  <td>#{p.id}</td>
                  <td 
                    style={{cursor: 'pointer', color: '#3498db', fontWeight: '500'}}
                    onClick={() => setViewingProduct(p)}
                  >
                    {p.name}
                  </td>
                  <td style={priceText}>{p.price_export.toLocaleString()}₫</td>
                  <td><span style={p.stock < 10 ? lowStockStyle : normalStockStyle}>{p.stock}</span></td>
                  <td><button style={btnAdd} onClick={() => addToCart(p)}>+ Thêm</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={cartSection}>
        <h3 style={{marginTop: 0}}>🛒 Giỏ hàng</h3>
        <div style={cartList}>
          {cart.map(item => (
            <div key={item.id} style={cartItem}>
              <div style={{flex: 1}}>
                <div style={{fontSize: '14px', fontWeight: 'bold'}}>{item.name}</div>
                <div style={{fontSize: '12px'}}>{item.quantity} x {item.price_export.toLocaleString()}₫</div>
              </div>
              <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={btnDelete}>✕</button>
            </div>
          ))}
        </div>
        <div style={checkoutArea}>
          <div style={totalStyle}>
            <span>Tổng:</span>
            <span style={{color: '#e74c3c'}}>{totalAmount.toLocaleString()}₫</span>
          </div>
          <button style={btnPay} disabled={cart.length === 0} onClick={handleCheckout}>XÁC NHẬN</button>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT SẢN PHẨM */}
      {viewingProduct && (
        <div style={modalOverlay} onClick={() => setViewingProduct(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{color: '#2c3e50'}}>{viewingProduct.name}</h2>
            <hr/>
            <p><b>Thương hiệu:</b> {viewingProduct.brand || 'N/A'}</p>
            <p><b>Danh mục:</b> {viewingProduct.category || 'N/A'}</p>
            <p><b>Thông số kỹ thuật:</b></p>
            <div style={specsBox}>{viewingProduct.specs || 'Không có mô tả chi tiết.'}</div>
            <p><b>Giá niêm yết:</b> <span style={priceText}>{viewingProduct.price_export.toLocaleString()}₫</span></p>
            <button style={btnClose} onClick={() => setViewingProduct(null)}>Đóng</button>
          </div>
        </div>
      )}

      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)} cart={lastOrder.cart} total={lastOrder.total} />
    </div>
  );
}

// --- THÊM STYLE MỚI ---
const customerSelect = { padding: '8px', borderRadius: '8px', border: '1px solid #3498db', outline: 'none', background: '#f0f9ff', width: '200px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '15px', width: '500px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' };
const specsBox = { background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee', lineHeight: '1.6' };
const btnClose = { marginTop: '20px', width: '100%', padding: '10px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };

// Các style cũ giữ nguyên...
const containerStyle = { display: 'flex', gap: '20px', height: 'calc(100vh - 100px)', padding: '10px' };
const productSection = { flex: 2.5, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const headerAction = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const searchInput = { width: '50%', padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' };
const tableContainer = { flex: 1, overflowY: 'auto' };
const productTable = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeader = { borderBottom: '2px solid #eee', color: '#7f8c8d' };
const tableRow = { borderBottom: '1px solid #f5f5f5' };
const priceText = { color: '#27ae60', fontWeight: 'bold' };
const lowStockStyle = { color: '#e67e22', fontWeight: 'bold' };
const normalStockStyle = { color: '#2c3e50' };
const btnAdd = { padding: '6px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cartSection = { flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0' };
const cartList = { flex: 1, overflowY: 'auto' };
const cartItem = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f1f1' };
const checkoutArea = { paddingTop: '20px' };
const totalStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' };
const btnPay = { width: '100%', padding: '16px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#27ae60', fontWeight: 'bold' };
const btnDelete = { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' };