import React, { useState, useEffect } from "react";
import { getDb } from "../services/db";
import { message, ask } from "@tauri-apps/plugin-dialog";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "staff" });
  const [editPass, setEditPass] = useState({ id: null, newPassword: "" });

  // 1. Load danh sách user
  const fetchUsers = async () => {
    try {
      const db = await getDb();
      const res = await db.select("SELECT id, username, role FROM users ORDER BY id DESC");
      setUsers(res);
    } catch (err) {
      console.error("Lỗi fetch users:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. Thêm tài khoản mới
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      await message("Vui lòng nhập đủ tên và mật khẩu", { kind: "error" });
      return;
    }
    try {
      const db = await getDb();
      await db.execute(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        [newUser.username, newUser.password, newUser.role]
      );
      await message("Tạo tài khoản thành công!");
      setNewUser({ username: "", password: "", role: "staff" });
      fetchUsers();
    } catch (e) {
      await message("Tên đăng nhập đã tồn tại!", { kind: "error" });
    }
  };

  // 3. Xóa tài khoản
  const handleDelete = async (id, username) => {
    const confirmed = await ask(`Bạn có chắc muốn xóa tài khoản ${username}?`, {
      title: "Xác nhận xóa",
      kind: "warning",
    });
    
    if (confirmed) {
      try {
        const db = await getDb();
        await db.execute("DELETE FROM users WHERE id = $1", [id]);
        fetchUsers();
      } catch (err) {
        await message("Lỗi khi xóa!");
      }
    }
  };

  // 4. Cập nhật mật khẩu
  const handleUpdatePassword = async (id) => {
    if (!editPass.newPassword) return;
    try {
      const db = await getDb();
      await db.execute("UPDATE users SET password = $1 WHERE id = $2", [editPass.newPassword, id]);
      await message("Đã cập nhật mật khẩu mới!");
      setEditPass({ id: null, newPassword: "" });
    } catch (e) {
      await message("Lỗi cập nhật mật khẩu", { kind: "error" });
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={{marginTop: 0}}>👤 QUẢN LÝ TÀI KHOẢN NHÂN VIÊN</h3>
      
      <div style={formRow}>
        <input placeholder="Tên đăng nhập" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} style={inputStyle} />
        <input type="password" placeholder="Mật khẩu" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={inputStyle} />
        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={inputStyle}>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị</option>
        </select>
        <button onClick={handleAddUser} style={btnPrimary}>+ THÊM TÀI KHOẢN</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={thStyle}>Tên đăng nhập</th>
            <th style={thStyle}>Quyền hạn</th>
            <th style={thStyle}>Mật khẩu mới</th>
            <th style={thStyle}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}><strong>{u.username}</strong></td>
              <td style={tdStyle}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                  background: u.role === 'admin' ? '#ffeaa7' : '#fab1a0' 
                }}>{u.role.toUpperCase()}</span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="password" 
                    placeholder="Mới..." 
                    style={miniInput}
                    value={editPass.id === u.id ? editPass.newPassword : ""}
                    onChange={(e) => setEditPass({ id: u.id, newPassword: e.target.value })}
                  />
                  <button 
                    onClick={() => handleUpdatePassword(u.id)}
                    style={editPass.id === u.id && editPass.newPassword ? activeSaveBtn : disabledSaveBtn}
                  >Lưu</button>
                </div>
              </td>
              <td style={tdStyle}>
                {u.username !== 'admin' && (
                  <button onClick={() => handleDelete(u.id, u.username)} style={delBtn}>Xóa</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Styles 
const containerStyle = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const formRow = { display: 'flex', gap: '10px', marginBottom: '30px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 };
const btnPrimary = { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '12px', borderBottom: '2px solid #ddd', color: '#666' };
const tdStyle = { padding: '12px' };
const miniInput = { padding: '5px', width: '100px', border: '1px solid #ccc', borderRadius: '3px' };
const activeSaveBtn = { background: '#3498db', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' };
const disabledSaveBtn = { background: '#bdc3c7', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'default' };
const delBtn = { background: 'none', color: '#ff7675', border: '1px solid #ff7675', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' };