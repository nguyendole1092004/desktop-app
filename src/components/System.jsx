import React, { useState } from "react";
import { save, open, message, ask } from "@tauri-apps/plugin-dialog";
import { copyFile, readFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import UserManagement from "./UserManagement"; 
import ChangePassword from "./ChangePassword"; 

export default function System({ user }) { 
  const [showUserLogs, setShowUserLogs] = useState(false);
  const [showMyAccount, setShowMyAccount] = useState(false);

  // Kiểm tra quyền Admin
  const isAdmin = user?.role === "admin";

  // --- HÀM TẠO TÊN FILE TỰ ĐỘNG ---
  const getAutoFilename = () => {
    const now = new Date();
    const date = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
    const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    return `pos_backup_${date}_${time}.db`;
  };

  // --- HÀM KIỂM TRA FILE DB HỢP LỆ ---
  const isValidSqlite = async (filePath) => {
    try {
      const contents = await readFile(filePath);
      const header = contents.slice(0, 16);
      const magicString = new TextDecoder().decode(header);
      return magicString.startsWith("SQLite format 3");
    } catch (e) { return false; }
  };

  // --- LOGIC SAO LƯU ---
  const handleBackup = async () => {
    try {
      const selectedPath = await save({
        filters: [{ name: "Database", extensions: ["db"] }],
        defaultPath: getAutoFilename(),
      });
      if (!selectedPath) return;
      const appDataPath = await appDataDir();
      const sourceDb = await join(appDataPath, "inventory_pro.db"); // Hãy đảm bảo tên file này khớp với db.js của bạn
      await copyFile(sourceDb, selectedPath);
      await message("Sao lưu dữ liệu thành công!", { title: "Thông báo", kind: "info" });
    } catch (error) {
      await message("Lỗi sao lưu: " + error, { title: "Thất bại", kind: "error" });
    }
  };

  // --- LOGIC KHÔI PHỤC ---
  const handleRestore = async () => {
    try {
      const confirmed = await ask("Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn. Bạn có chắc chắn không?", { title: "Cảnh báo cực kỳ quan trọng", kind: "warning" });
      if (!confirmed) return;
      
      const selectedFile = await open({ multiple: false, filters: [{ name: "Database", extensions: ["db"] }] });
      if (!selectedFile) return;

      if (!(await isValidSqlite(selectedFile))) {
        return await message("File bạn chọn không phải là file dữ liệu hợp lệ!", { kind: "error" });
      }

      const appDataPath = await appDataDir();
      const targetDb = await join(appDataPath, "inventory_pro.db");
      await copyFile(selectedFile, targetDb);
      
      await message("Khôi phục thành công! Ứng dụng sẽ tự khởi động lại để cập nhật.");
      window.location.reload();
    } catch (error) {
      await message("Lỗi khôi phục: " + error, { kind: "error" });
    }
  };

  const goBack = () => {
    setShowUserLogs(false);
    setShowMyAccount(false);
  };

  return (
    <div style={{ padding: "30px", background: "#f9f9f9", minHeight: "100vh" }}>
      <h2 style={{ borderBottom: "2px solid #27ae60", paddingBottom: "10px", marginBottom: "30px", color: "#2c3e50" }}>
        ⚙️ {isAdmin ? "QUẢN TRỊ HỆ THỐNG" : "THIẾT LẬP TÀI KHOẢN"}
      </h2>

      {showUserLogs ? (
        <div>
          <button onClick={goBack} style={backBtnStyle}>⬅️ Quay lại Hệ thống</button>
          <UserManagement />
        </div>
      ) : showMyAccount ? (
        <div>
          <button onClick={goBack} style={backBtnStyle}>⬅️ Quay lại Hệ thống</button>
          <ChangePassword user={user} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
          
          {/* CHỈ ADMIN MỚI THẤY SAO LƯU / KHÔI PHỤC / NHÂN SỰ */}
          {isAdmin && (
            <>
              <div style={cardStyle}>
                <div style={iconStyle}>💾</div>
                <h3>Sao lưu dữ liệu</h3>
                <p style={textStyle}>Lưu một bản copy an toàn của dữ liệu ra ngoài máy tính.</p>
                <button onClick={handleBackup} style={btnStyle}>XUẤT FILE (.DB)</button>
              </div>

              <div style={cardStyle}>
                <div style={iconStyle}>🔄</div>
                <h3>Khôi phục dữ liệu</h3>
                <p style={textStyle}>Ghi đè dữ liệu cũ bằng một bản sao lưu đã có sẵn.</p>
                <button onClick={handleRestore} style={{ ...btnStyle, background: "#f39c12" }}>CHỌN FILE PHỤC HỒI</button>
              </div>

              <div style={cardStyle}>
                <div style={iconStyle}>👥</div>
                <h3>Quản lý nhân sự</h3>
                <p style={textStyle}>Xem danh sách, thêm bớt nhân viên và cấp quyền.</p>
                <button onClick={() => setShowUserLogs(true)} style={{ ...btnStyle, background: "#9b59b6" }}>MỞ QUẢN LÝ</button>
              </div>
            </>
          )}

          {/* AI CŨNG THẤY PHẦN ĐỔI MẬT KHẨU */}
          <div style={cardStyle}>
            <div style={iconStyle}>🔐</div>
            <h3>Tài khoản</h3>
            <p style={textStyle}>Cập nhật mật khẩu mới cho tài khoản <strong>{user?.username}</strong>.</p>
            <button onClick={() => setShowMyAccount(true)} style={{ ...btnStyle, background: "#34495e" }}>ĐỔI MẬT KHẨU</button>
          </div>
          
        </div>
      )}
    </div>
  );
}

// --- GIỮ NGUYÊN STYLES ĐẸP CỦA BẠN ---
const cardStyle = { 
  background: "#fff", 
  padding: "30px", 
  borderRadius: "12px", 
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)", 
  flex: "1", 
  maxWidth: "300px", // Khống chế độ rộng để card không bị quá to khi ít mục
  minWidth: "250px", 
  display: "flex", 
  flexDirection: "column", 
  alignItems: "center", 
  textAlign: "center" 
};
const iconStyle = { fontSize: "40px", marginBottom: "15px" };
const textStyle = { color: "#666", fontSize: "13px", marginBottom: "20px", minHeight: "35px" };
const btnStyle = { width: "100%", padding: "10px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const backBtnStyle = { marginBottom: "20px", cursor: "pointer", padding: "8px 15px", borderRadius: "5px", border: "1px solid #ccc", background: "#fff", fontWeight: "bold" };