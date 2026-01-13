import React, { useState } from "react";
import { getDb } from "../services/db";
import { message } from "@tauri-apps/plugin-dialog";

export default function ChangePassword({ user }) {
  const [form, setForm] = useState({ oldPass: "", newPass: "", confirmPass: "" });

  const handleUpdate = async () => {
    if (form.newPass !== form.confirmPass) {
      return message("Mật khẩu mới không khớp!", { kind: "error" });
    }

    const db = await getDb();
    // Kiểm tra mật khẩu cũ
    const check = await db.select("SELECT * FROM users WHERE id = $1 AND password = $2", [user.id, form.oldPass]);
    
    if (check.length === 0) {
      return message("Mật khẩu cũ không chính xác!", { kind: "error" });
    }

    await db.execute("UPDATE users SET password = $1 WHERE id = $2", [form.newPass, user.id]);
    await message("Đổi mật khẩu thành công!");
    setForm({ oldPass: "", newPass: "", confirmPass: "" });
  };

  return (
    <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", maxWidth: "400px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <h3>🔐 ĐỔI MẬT KHẨU CÁ NHÂN</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <input type="password" placeholder="Mật khẩu hiện tại" style={inputS} value={form.oldPass} onChange={e => setForm({...form, oldPass: e.target.value})} />
        <input type="password" placeholder="Mật khẩu mới" style={inputS} value={form.newPass} onChange={e => setForm({...form, newPass: e.target.value})} />
        <input type="password" placeholder="Xác nhận mật khẩu mới" style={inputS} value={form.confirmPass} onChange={e => setForm({...form, confirmPass: e.target.value})} />
        <button onClick={handleUpdate} style={{ padding: "12px", background: "#34495e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          CẬP NHẬT MẬT KHẨU
        </button>
      </div>
    </div>
  );
}
const inputS = { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" };