import React, { useState } from "react";

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [isHovered, setIsHovered] = useState(false);

  // Cấu hình Menu: Di chuyển 'nhap_kho' lên nhóm 'all'
  const menuItems = [
    { id: 'pos', label: 'Bán hàng', icon: '💰', role: 'all' },
    { id: 'products', label: 'Danh mục sản phẩm', icon: '🏷️', role: 'all' },
    { id: 'nhap_kho', label: 'Nhập kho', icon: '📥', role: 'all' }, // <--- Nhân viên đã có quyền này
    { id: 'customers', label: 'Khách hàng', icon: '👥', role: 'all' },
    { id: 'system', label: 'Hệ thống', icon: '🛠️', role: 'all' }, 
    
    // Các Module chỉ dành riêng cho Admin (Báo cáo, Nhà cung cấp, Lịch sử chi tiết)
    { id: 'suppliers', label: 'Nhà cung cấp', icon: '🏢', role: 'admin' },
    { id: 'history', label: 'Lịch sử kho', icon: '🕒', role: 'all' },
    { id: 'reports', label: 'Báo cáo', icon: '📊', role: 'admin' },
  ];

  // Lọc menu dựa trên role
  const filteredMenu = menuItems.filter(item =>
    item.role === 'all' || (user && user.role === 'admin')
  );

  const sidebarWidth = isHovered ? '240px' : '70px';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: sidebarWidth,
        background: '#2c3e50',
        color: 'white',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        position: 'fixed',
        left: 0,
        top: 0,
        boxSizing: 'border-box',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* LOGO AREA */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #34495e',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isHovered ? 'flex-start' : 'center',
        paddingLeft: isHovered ? '25px' : '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '20px' }}>
          {isHovered ? "💎 POS PREMIUM" : "💎"}
        </h3>
      </div>

      {/* MENU ITEMS */}
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '12px 15px',
              cursor: 'pointer',
              background: activeTab === item.id ? '#3498db' : 'transparent',
              color: activeTab === item.id ? 'white' : '#bdc3c7',
              borderRadius: '8px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '20px', minWidth: '30px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{
              opacity: isHovered ? 1 : 0,
              visibility: isHovered ? 'visible' : 'hidden',
              transition: 'opacity 0.2s',
              fontWeight: activeTab === item.id ? 'bold' : 'normal'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER / USER AREA */}
      <div style={{
        borderTop: '1px solid #34495e',
        padding: '15px 10px',
        background: '#1a252f',
        whiteSpace: 'nowrap'
      }}>
        {isHovered && (
          <div style={{ marginBottom: '10px', fontSize: '13px', textAlign: 'center' }}>
            <span style={{ color: '#bdc3c7' }}></span> <strong>{user?.username}</strong>
            <br />
            <span style={{
              fontSize: '10px',
              background: user?.role === 'admin' ? '#e67e22' : '#27ae60',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '10px',
              marginTop: '5px',
              display: 'inline-block',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}>
              {user?.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
            </span>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: '#c0392b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#e74c3c'}
          onMouseOut={(e) => e.target.style.background = '#c0392b'}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          {isHovered && <span style={{ fontWeight: 'bold', fontSize: '13px' }}>ĐĂNG XUẤT</span>}
        </button>
      </div>
    </div>
  );
}