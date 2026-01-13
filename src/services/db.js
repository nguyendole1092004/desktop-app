import Database from "@tauri-apps/plugin-sql";

export const getDb = async () => {
    // Tên file db của bạn: inventory_pro.db
    return await Database.load("sqlite:inventory_pro.db");
};

export const initTables = async () => {
    const db = await getDb();

    // Kích hoạt hỗ trợ khóa ngoại cho SQLite (Rất quan trọng)
    await db.execute("PRAGMA foreign_keys = ON;");

    // 1. Bảng Products (Sản phẩm) - Thêm cột is_active để hỗ trợ xóa mềm
    await db.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT,
            category TEXT,
            specs TEXT,
            price_import REAL DEFAULT 0,
            price_export REAL DEFAULT 0,
            stock INTEGER DEFAULT 0,
            image_url TEXT,
            is_active INTEGER DEFAULT 1 -- 1: Đang bán, 0: Đã ẩn/xóa
        )
    `);

    // 2. Bảng Users (Người dùng/Nhân viên)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'staff',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Chèn Admin mặc định
    await db.execute(`
        INSERT OR IGNORE INTO users (id, username, password, role) 
        VALUES (1, 'admin', 'admin123', 'admin')
    `);

    // 3. Bảng Customers (Khách hàng)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE,
            points INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Bảng Suppliers (Nhà cung cấp)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 5. Bảng Orders (Hóa đơn tổng)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            user_id INTEGER,
            total_amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    // 6. Bảng Order_Details (Chi tiết đơn hàng)
    // Giữ nguyên tham chiếu để ngăn xóa cứng sản phẩm đã từng bán (Bảo vệ dữ liệu kế toán)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS order_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // 7. Bảng Stock_History (Lịch sử kho) - Thêm ON DELETE CASCADE
    await db.execute(`
        CREATE TABLE IF NOT EXISTS stock_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            type TEXT CHECK(type IN ('IMPORT', 'EXPORT')),
            quantity INTEGER NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    // 8. Bảng Logs - Thêm ON DELETE CASCADE
    await db.execute(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            action_type TEXT,
            quantity INTEGER,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    // --- CƠ CHẾ MIGRATION (Cập nhật cấu trúc nếu đã có file db cũ) ---
    const alterCommands = [
        "ALTER TABLE products ADD COLUMN brand TEXT",
        "ALTER TABLE products ADD COLUMN category TEXT",
        "ALTER TABLE products ADD COLUMN specs TEXT",
        "ALTER TABLE products ADD COLUMN price_import REAL DEFAULT 0",
        "ALTER TABLE products ADD COLUMN price_export REAL DEFAULT 0",
        "ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0",
        "ALTER TABLE products ADD COLUMN image_url TEXT",
        "ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1"
    ];

    for (const cmd of alterCommands) {
        try { 
            await db.execute(cmd); 
        } catch (e) {
            // Bỏ qua lỗi nếu cột đã tồn tại
        }
    }
};