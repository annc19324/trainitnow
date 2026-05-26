"use client";

import { useLanguage } from "@/components/LanguageContext";
import { useState } from "react";
import { User, Trash2, Edit } from "lucide-react";

export default function AdminUsersClient({ users: initialUsers }: { users: any[] }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (e) {
      alert("Error deleting user");
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
      const res = await fetch(`/api/users/${id}`, {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{t("admin.users")}</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage all registered users on the platform.</p>
        </div>
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
