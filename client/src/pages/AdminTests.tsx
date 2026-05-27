import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Trash2 } from "lucide-react";
import { apiRequest } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import { useLanguage } from "../components/LanguageContext";
import styles from "./Admin.module.css";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await apiRequest("/api/tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiRequest(`/api/tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTests(tests.filter(t => t.id !== id));
        showToast(language === "vi" ? "Đã xóa bài kiểm tra thành công!" : "Deleted test successfully!", "success");
      } else {
        showToast(language === "vi" ? "Không thể xóa bài kiểm tra!" : "Failed to delete test!", "error");
      }
    } catch (e) {
      console.error(e);
      showToast(language === "vi" ? "Lỗi hệ thống khi xóa bài kiểm tra!" : "System error deleting test!", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading tests...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className="gradient-text">Quản lý bài kiểm tra</h1>
        <p>Quản lý toàn bộ bài kiểm tra được đăng trên hệ thống.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <Link to="/tests/create" className="btn btn-primary">Tạo bài mới</Link>
      </div>

      {tests.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <CheckCircle size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3 style={{ marginBottom: "1rem" }}>Không tìm thấy bài kiểm tra nào</h3>
          <Link to="/tests/create" className="btn btn-primary">
            Tạo bài đầu tiên
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tests.map(test => (
            <div key={test.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{test.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Chủ đề: {test.topic?.title || "Chung"} • Loại: {test.type} • {test._count?.questions || 0} câu hỏi
                </p>
              </div>
              <div>
                <button onClick={() => handleDelete(test.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
