import { useState, useEffect } from "react";
import { useLanguage } from "../components/LanguageContext";
import { Trash2, Edit } from "lucide-react";
import { apiRequest } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import styles from "../styles/Admin.module.css";

export default function AdminUsersPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest("/api/users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      });
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiRequest(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        showToast(language === "vi" ? "Đã xóa người dùng thành công!" : "Deleted user successfully!", "success");
      } else {
        showToast(language === "vi" ? "Không thể xóa người dùng!" : "Failed to delete user!", "error");
      }
    } catch (e) {
      showToast(language === "vi" ? "Lỗi hệ thống khi xóa người dùng!" : "Error deleting user!", "error");
    }
  };

  const handleEditInit = (user: any) => {
    setEditingId(user.id);
    setEditName(user.name || "");
    setEditRole(user.role);
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    try {
      const res = await apiRequest(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, role: editRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, name: editName, role: editRole } : u));
        setEditingId(null);
      } else {
        alert("Failed to update user");
      }
    } catch (e) {
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className="gradient-text">{t("admin.users")}</h1>
        <p>{language === "vi" ? "Quản lý toàn bộ tài khoản người dùng trên hệ thống." : "Manage all registered users on the platform."}</p>
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Name</th>
              <th style={{ padding: "1rem" }}>Username / Email</th>
              <th style={{ padding: "1rem" }}>Role</th>
              <th style={{ padding: "1rem" }}>Joined</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "1rem", fontWeight: "500" }}>
                  {editingId === user.id ? (
                    <input 
                      className="input-field" 
                      style={{ padding: "0.25rem 0.5rem" }} 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                  <div>@{user.username || user.name}</div>
                  <div style={{ fontSize: "0.85rem" }}>{user.email}</div>
                </td>
                <td style={{ padding: "1rem" }}>
                  {editingId === user.id ? (
                    <select 
                      className="input-field" 
                      style={{ padding: "0.25rem 0.5rem" }} 
                      value={editRole} 
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <span style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "999px", 
                      fontSize: "0.8rem", 
                      fontWeight: "600",
                      background: user.role === "ADMIN" ? "var(--warning)" : "var(--accent-primary)",
                      color: "white"
                    }}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => handleUpdate(user.id)} className="btn btn-primary" style={{ padding: "0.4rem 0.8rem" }} disabled={loading}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem" }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditInit(user)} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem" }}>
                          <Edit size={16} />
                        </button>
                        {user.role !== "ADMIN" && (
                          <button onClick={() => handleDelete(user.id)} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", color: "var(--danger)" }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
