import { useState, useEffect } from "react";
import styles from "../../styles/Admin.module.css";
import { Plus, Trash2, Edit, CheckCircle, X } from "lucide-react";
import { apiRequest } from "../../components/AuthContext";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      display: "flex", alignItems: "center", gap: "0.75rem",
      background: type === "success" ? "var(--success)" : "var(--danger)",
      color: "white", padding: "0.875rem 1.25rem",
      borderRadius: "var(--radius-md)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      animation: "fadeIn 0.3s ease",
      minWidth: "260px",
    }}>
      <CheckCircle size={18} />
      <span style={{ flex: 1, fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
        <X size={16} />
      </button>
    </div>
  );
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const res = await apiRequest("/api/topics");
    if (res.ok) {
      const data = await res.json();
      setTopics(data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiRequest("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });
    setLoading(false);
    if (res.ok) {
      setTitle("");
      setDescription("");
      fetchTopics();
      showToast("Tạo chủ đề thành công!");
    } else {
      showToast("Lỗi khi tạo chủ đề", "error");
    }
  };

  // No confirm dialog used here as requested by user - toast is used instead
  const handleDelete = async (id: string) => {
    const res = await apiRequest(`/api/topics/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTopics(topics.filter(t => t.id !== id));
      showToast("Đã xóa chủ đề");
    } else {
      showToast("Lỗi khi xóa chủ đề", "error");
    }
  };

  const handleEditInit = (topic: any) => {
    setEditingId(topic.id);
    setEditTitle(topic.title);
    setEditDescription(topic.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    const res = await apiRequest(`/api/topics/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription })
    });
    setLoading(false);
    if (res.ok) {
      setEditingId(null);
      fetchTopics();
      showToast("Cập nhật chủ đề thành công!");
    } else {
      showToast("Lỗi khi cập nhật", "error");
    }
  };

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className={styles.pageHeader}>
        <h1 className="gradient-text">Quản lý chủ đề</h1>
      </div>

      <div className={`glass-panel`} style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Tạo chủ đề mới</h3>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Tiêu đề</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Mô tả</label>
            <textarea
              className="input-field"
              style={{ minHeight: "100px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start" }}>
            <Plus size={16} style={{ marginRight: "0.5rem" }} /> {loading ? "Đang tạo..." : "Tạo chủ đề"}
          </button>
        </form>
      </div>

      <div className={styles.statsGrid} style={{ gridTemplateColumns: "1fr" }}>
        {topics.map(topic => (
          <div key={topic.id} className="glass-panel" style={{ padding: "1.5rem" }}>
            {editingId === topic.id ? (
              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                  className="input-field"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
                <textarea
                  className="input-field"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{topic.title}</h3>
                  <p style={{ color: "var(--text-secondary)" }}>{topic.description}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button onClick={() => handleEditInit(topic)} className="btn btn-secondary">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(topic.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
