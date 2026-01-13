import React, { useState } from "react";
import { getDb } from "../services/db";
import { message, ask } from "@tauri-apps/plugin-dialog";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIC GIỮ NGUYÊN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const db = await getDb();
      const users = await db.select(
        "SELECT * FROM users WHERE username = $1 AND password = $2",
        [username, password]
      );
      if (users.length > 0) {
        onLogin(users[0]);
      } else {
        setError("Thông tin xác thực không chính xác");
      }
    } catch (err) {
      setError("Lỗi kết nối hệ thống máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const masterKey = prompt("Nhập mã ghi đè hệ thống (Master Override):");
    if (masterKey === "999999") {
      const confirmed = await ask("Xác nhận khôi phục mật khẩu quản trị?", {
        title: "SYSTEM OVERRIDE",
        kind: "warning",
      });
      if (confirmed) {
        try {
          const db = await getDb();
          await db.execute(
            "UPDATE users SET password = $1 WHERE username = 'admin'",
            ["admin123"]
          );
          await message("Khôi phục thành công! Mật khẩu: admin123");
        } catch (err) {
          alert("Lỗi cơ sở dữ liệu!");
        }
      }
    } else if (masterKey !== null) {
      alert("Mã truy cập sai!");
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        {/* Header Decal */}
        <div style={headerStyle}>
          <div style={logoIcon}></div>
          <div>
            <h2 style={titleStyle}>POS PREMIUM</h2>
            <p style={subtitleStyle}>Nhóm 4</p>
          </div>
        </div>
        
        {error && <div style={errorStyle}>{error}</div>}

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            placeholder="Tên đăng nhập..."
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={labelStyle}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Mật khẩu..."
            required
          />
        </div>

        <div style={{ textAlign: "right", marginBottom: "25px" }}>
          <span onClick={handleForgotPassword} style={forgotPwdStyle}>
            Khôi phục truy cập?
          </span>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{
            ...buttonStyle,
            backgroundColor: loading ? "#4a5568" : "#3182ce"
          }}
        >
          {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP HỆ THỐNG"}
        </button>

        <div style={footerStyle}>
          
        </div>
      </form>
    </div>
  );
}

// --- STYLES: INDUSTRIAL MODERN ---

const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#1a202c", // Xanh đen Slate (dễ nhìn hơn đen tuyền)
  fontFamily: "system-ui, -apple-system, sans-serif"
};

const formStyle = {
  width: "350px",
  padding: "40px",
  background: "#2d3748", // Màu xám xanh (giống vỏ các thiết bị điện tử)
  borderRadius: "12px",
  border: "1px solid #4a5568",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  marginBottom: "30px",
  borderLeft: "4px solid #63b3ed",
  paddingLeft: "15px"
};

const logoIcon = {
  width: "12px",
  height: "12px",
  backgroundColor: "#63b3ed",
  boxShadow: "0 0 10px #63b3ed"
};

const titleStyle = {
  margin: 0,
  fontSize: "20px",
  color: "#edf2f7",
  letterSpacing: "1px",
  fontWeight: "bold"
};

const subtitleStyle = {
  margin: 0,
  fontSize: "10px",
  color: "#a0aec0",
  letterSpacing: "2px"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#a0aec0",
  textTransform: "uppercase"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  backgroundColor: "#1a202c",
  border: "1px solid #4a5568",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  transition: "border 0.2s",
  focus: { border: "1px solid #63b3ed" }
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "13px",
  letterSpacing: "1px",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)"
};

const errorStyle = {
  backgroundColor: "rgba(245, 101, 101, 0.1)",
  color: "#feb2b2",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "20px",
  textAlign: "center",
  fontSize: "12px",
  border: "1px solid #f56565"
};

const forgotPwdStyle = {
  fontSize: "11px",
  color: "#718096",
  cursor: "pointer",
  textDecoration: "underline"
};

const footerStyle = {
  marginTop: "25px",
  textAlign: "center",
  fontSize: "10px",
  color: "#4a5568",
  fontWeight: "bold"
};