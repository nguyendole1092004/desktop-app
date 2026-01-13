import { useState, useEffect } from "react";
import { getDb, initTables } from "./services/db";
import Sidebar from "./components/Sidebar";
import ProductList from "./components/ProductList";
import Inventory from "./components/Inventory";
import Sales from "./components/Sales";
import Reports from "./components/Reports";
import TransactionLogs from "./components/TransactionLogs";
import EditProductModal from "./components/EditProductModal";
import System from "./components/System";
import Login from "./components/Login";
import Customers from "./components/Customers";
import Suppliers from "./components/Suppliers";

function App() {
  const [activeTab, setActiveTab] = useState("pos");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // 1. Sửa hàm fetchData để lọc sản phẩm đã bị xóa mềm (is_active = 1)
  const fetchData = async () => {
    try {
      await initTables();
      const db = await getDb();
      const sql = `
        SELECT p.*, 
        (SELECT s.name FROM stock_history sh
         JOIN suppliers s ON sh.note LIKE '%' || s.name || '%'
         WHERE sh.product_id = p.id AND sh.type = 'IMPORT'
         ORDER BY sh.id DESC LIMIT 1) as supplier_name
        FROM products p 
        WHERE p.is_active = 1 
        AND (p.name LIKE $1 OR p.brand LIKE $1 OR p.category LIKE $1)
        ORDER BY p.id DESC
      `;
      const res = await db.select(sql, [`%${searchTerm}%`]);
      setProducts(res);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [searchTerm, activeTab, user]);

  // 2. Cải tiến hàm cập nhật kho hàng
  const updateStock = async (productId, amount, type, note = "") => {
    try {
      const db = await getDb();
      const change = type.toUpperCase() === 'IMPORT' ? amount : -amount;
      
      // Cập nhật số lượng tồn kho
      await db.execute("UPDATE products SET stock = stock + $1 WHERE id = $2", [change, productId]);
      
      // Lưu lịch sử biến động
      await db.execute(
        "INSERT INTO stock_history (product_id, type, quantity, note) VALUES ($1, $2, $3, $4)",
        [productId, type.toUpperCase(), amount, note || `Điều chỉnh ${type}`]
      );
      
      await fetchData(); // Tải lại danh sách sau khi cập nhật
    } catch (error) {
      console.error("Lỗi cập nhật kho:", error);
      alert("Lỗi hệ thống khi cập nhật số lượng!");
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5", overflow: "hidden" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={() => setUser(null)}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      <main style={{
        flex: 1,
        overflowY: "auto",
        padding: "25px",
        marginLeft: isSidebarExpanded ? "240px" : "70px",
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>

        {activeTab === "pos" && (
          <Sales products={products} onUpdateStock={updateStock} user={user} />
        )}

        {activeTab === "products" && (
          <ProductList
            products={products}
            onUpdateStock={updateStock}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refreshData={fetchData} // Truyền hàm này để ProductList gọi sau khi xóa
            onEdit={setEditingProduct}
            isAdmin={user.role === 'admin'}
          />
        )}

        {activeTab === "customers" && <Customers />}
        {activeTab === "nhap_kho" && <Inventory refreshData={fetchData} />}
        {activeTab === "history" && <TransactionLogs />}
        {activeTab === "system" && <System user={user} />}

        {user.role === "admin" && (
          <>
            {activeTab === "suppliers" && <Suppliers />}
            {activeTab === "reports" && <Reports products={products} />}
          </>
        )}

        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            refreshData={fetchData}
          />
        )}
      </main>
    </div>
  );
}

export default App;