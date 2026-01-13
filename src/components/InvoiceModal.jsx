import React from "react";

export default function InvoiceModal({ isOpen, onClose, cart, total }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print(); // Lệnh in của hệ thống
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="print-container">
        {/* Nội dung hóa đơn */}
        <div id="invoice-content" style={invoiceBox}>
          <center>
            <h2 style={{ margin: "0" }}>CỬA HÀNG ĐỒ ĐIỆN TỬ</h2>
            <p style={{ fontSize: "12px" }}>Đ/C: Đường Chiến Thắng-Hà Đông-Hà Nội</p>
            <p style={{ fontSize: "12px" }}>SĐT: 0987.654.321</p>
            <hr />
            <h3>HÓA ĐƠN BÁN LẺ</h3>
          </center>

          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th align="left">Tên món</th>
                <th align="center">SL</th>
                <th align="right">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td align="center">{item.quantity}</td>
                  <td align="right">{(item.price_export * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr style={{ borderTop: "1px dashed #000" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>TỔNG CỘNG:</span>
            <span>{total.toLocaleString()}₫</span>
          </div>

          <center style={{ marginTop: "20px", fontSize: "11px" }}>
            <p>Cảm ơn quý khách. Hẹn gặp lại!</p>
            <p>{new Date().toLocaleString()}</p>
          </center>
        </div>

        {/* Nút điều khiển (Sẽ ẩn khi in) */}
        <div className="no-print" style={actionArea}>
          <button onClick={handlePrint} style={btnPrint}>In Hóa Đơn (Ctrl + P)</button>
          <button onClick={onClose} style={btnClose}>Đóng</button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

// Styles
const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", padding: "20px", borderRadius: "8px", width: "350px", maxHeight: "90vh", overflowY: "auto" };
const invoiceBox = { padding: "10px", color: "#000", fontFamily: "monospace" };
const actionArea = { marginTop: "20px", display: "flex", gap: "10px" };
const btnPrint = { flex: 1, padding: "10px", background: "#2ecc71", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnClose = { padding: "10px", background: "#95a5a6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };