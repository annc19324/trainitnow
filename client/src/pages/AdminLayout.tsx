import { Navigate, NavLink, Outlet } from "react-router-dom";
import styles from "../styles/Admin.module.css";
import { Settings, FileText, CheckCircle, BookOpen, Users, History, MessageSquare } from "lucide-react";
import { useAuth } from "../components/AuthContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Verifying privileges...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`glass-panel ${styles.sidebar}`}>
        <h2 className="gradient-text" style={{ padding: "1rem 1.5rem", marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>
          <Settings size={20} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} /> Admin
        </h2>
        <nav className={styles.nav}>
          <NavLink to="/admin" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><Settings size={16} /> Dashboard</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><Users size={16} /> Người dùng</NavLink>
          <NavLink to="/admin/topics" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><BookOpen size={16} /> Chủ đề</NavLink>
          <NavLink to="/admin/tests" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><CheckCircle size={16} /> Bài kiểm tra</NavLink>
          <NavLink to="/admin/documents" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><FileText size={16} /> Tài liệu</NavLink>
          <NavLink to="/admin/flashcards" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><BookOpen size={16} /> Thẻ ghi nhớ</NavLink>
          <NavLink to="/admin/history" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><History size={16} /> Lịch sử làm bài</NavLink>
          <NavLink to="/admin/chats" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}><MessageSquare size={16} /> Nhóm chat cộng đồng</NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

