# 📦 PHẦN MỀM QUẢN LÝ KHO HÀNG & BÁN HÀNG (TAURI DESKTOP APP)

Ứng dụng quản lý cửa hàng tiện lợi chạy trên nền tảng Desktop (Windows), được xây dựng bằng công nghệ **Tauri**, **ReactJS** và **SQLite**.

---

## 🚀 1. HƯỚNG DẪN CÀI ĐẶT (CHO NGƯỜI PHÁT TRIỂN)

Để chạy ứng dụng từ mã nguồn (Clone về máy), bạn cần cài đặt các môi trường sau:

* **Node.js**: Phiên bản 18.0 trở lên.
* **Rust & Cargo**: Cài đặt tại [rustup.rs](https://rustup.rs/).
* **Build Tools**: Cài đặt "Desktop development with C++" thông qua Visual Studio Installer.

### Các bước thực hiện:

1.  **Clone dự án về máy:**
    ```bash
    git clone [https://github.com/nguyendole1092004/desktop-app.git](https://github.com/nguyendole1092004/desktop-app.git)
    cd desktop-app
    ```

2.  **Cài đặt các thư viện Node.js:**
    ```bash
    npm install
    ```

3.  **Khởi chạy ứng dụng ở chế độ Dev:**
    ```bash
    npm run tauri dev
    ```

---

## 🔐 2. THÔNG TIN ĐĂNG NHẬP HỆ THỐNG

Hệ thống sử dụng cơ chế phân quyền (Role-based Access Control):

| Chức vụ | Tài khoản (Username) | Mật khẩu (Password) | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Toàn quyền: Xem báo cáo, quản lý nhân sự, cấu hình hệ thống. |


---

## ✨ 3. CÁC TÍNH NĂNG NỔI BẬT

* ✅ **Quản lý danh mục**: Sản phẩm (kèm hình ảnh), Nhà cung cấp, Khách hàng.
* ✅ **Nghiệp vụ kho**: Nhập hàng vào kho, theo dõi số lượng tồn thực tế.
* ✅ **Lịch sử biến động**: Ghi lại chi tiết mọi giao dịch nhập/xuất kho theo thời gian.
* ✅ **Báo cáo & Thống kê**: 
    * Tính tổng vốn tồn kho, lợi nhuận dự kiến.
    * Cảnh báo sản phẩm sắp hết hàng (dưới ngưỡng an toàn).
    * **Lọc dữ liệu** theo khoảng thời gian tùy chọn.
* ✅ **Xuất dữ liệu Excel**: Trích xuất báo cáo ra file `.xlsx` chuyên nghiệp.
* ✅ **Hệ thống**: Sao lưu (Backup) và Khôi phục (Restore) cơ sở dữ liệu SQLite.

---

## 🛠 4. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

* **Frontend**: ReactJS, Vite, CSS-in-JS.
* **Backend**: Rust (Tauri Framework) - Giúp ứng dụng nhẹ và bảo mật.
* **Database**: SQLite - Lưu trữ dữ liệu cục bộ, hoạt động offline 100%.
* **Library**: `xlsx` (Xử lý Excel), `tauri-plugin-sql` (Giao tiếp DB).

---

## 📂 5. CẤU TRÚC THƯ MỤC CHÍNH

* `/src`: Mã nguồn giao diện người dùng (React components).
* `/src-tauri`: Mã nguồn logic Backend (Rust) và cấu hình ứng dụng.
* `/src-tauri/shopping.db`: Tệp tin cơ sở dữ liệu của hệ thống.

---
**Thực hiện bởi:** Nguyễn Đỗ Lê  
**Ngày hoàn thành:** 13/01/2026
