import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Loader2, Camera } from "lucide-react";
import { apiRequest } from "../../components/AuthContext";
import { useToast } from "../../components/ToastContext";
import { useLanguage } from "../../components/LanguageContext";
import styles from "../../styles/Admin.module.css";

export default function AdminChatsPage() {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      const res = await apiRequest("/api/chat/groups");
      if (res.ok) setGroups(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await apiRequest(`/api/chat/admin/groups/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        if (res.ok) {
          const updated = await res.json();
          setGroups(groups.map(g => g.id === editingId ? updated : g));
          showToast(language === "vi" ? "Cập nhật nhóm thành công!" : "Group updated!", "success");
          resetForm();
        } else {
          showToast(language === "vi" ? "Lỗi cập nhật nhóm!" : "Failed to update group!", "error");
        }
      } else {
        const res = await apiRequest("/api/chat/admin/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        if (res.ok) {
          const created = await res.json();
          setGroups([...groups, created]);
          showToast(language === "vi" ? "Tạo nhóm thành công!" : "Group created!", "success");
          resetForm();
        } else {
          showToast(language === "vi" ? "Lỗi tạo nhóm!" : "Failed to create group!", "error");
        }
      }
    } catch (error) {
      showToast(language === "vi" ? "Lỗi kết nối máy chủ!" : "Server error!", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (group: any) => {
    setEditingId(group.id);
    setName(group.name);
    setDescription(group.description || "");
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiRequest(`/api/chat/admin/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGroups(groups.filter(g => g.id !== id));
        showToast(language === "vi" ? "Xóa nhóm thành công!" : "Group deleted!", "success");
        if (editingId === id) resetForm();
      } else {
        showToast(language === "vi" ? "Lỗi xóa nhóm!" : "Failed to delete!", "error");
      }
    } catch {
      showToast(language === "vi" ? "Lỗi hệ thống!" : "System error!", "error");
    }
  };

  const handleAvatarUpload = async (groupId: string, file: File) => {
    setUploadingId(groupId);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await apiRequest(`/api/chat/admin/groups/${groupId}/avatar`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(groups.map(g => g.id === groupId ? { ...g, avatarUrl: data.avatarUrl } : g));
        showToast(language === "vi" ? "Cập nhật ảnh nhóm thành công!" : "Group avatar updated!", "success");
      } else {
        showToast(language === "vi" ? "Lỗi tải ảnh nhóm lên!" : "Failed to upload group avatar!", "error");
      }
    } catch {
      showToast(language === "vi" ? "Lỗi kết nối!" : "Connection error!", "error");
    } finally {
      setUploadingId(null);
    }
  };

  const resetForm = () => { setEditingId(null); setName(""); setDescription(""); };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className="gradient-text">
          {language === "vi" ? "Quản lý Nhóm Chat" : "Manage Chat Groups"}
        </h1>
      </div>

      {/* Form */}
      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>
          {editingId ? (language === "vi" ? "Chỉnh sửa nhóm" : "Edit Group") : (language === "vi" ? "Tạo nhóm chat mới" : "Create New Group")}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              {language === "vi" ? "Tên nhóm *" : "Group Name *"}
            </label>
            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder={language === "vi" ? "Ví dụ: Nhóm học tiếng Anh" : "e.g., IELTS Study Group"} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              {language === "vi" ? "Mô tả ngắn" : "Short Description"}
            </label>
            <textarea className="input-field" style={{ minHeight: "80px", resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === "vi" ? "Mô tả hoạt động của nhóm..." : "Group description..."} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                : editingId
                  ? (language === "vi" ? "Lưu thay đổi" : "Save Changes")
                  : <><Plus size={16} style={{ marginRight: "0.5rem" }} />{language === "vi" ? "Tạo nhóm" : "Create Group"}</>
              }
            </button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>{language === "vi" ? "Hủy" : "Cancel"}</button>}
          </div>
        </form>
      </div>

      {/* Group List */}
      <h3 style={{ marginBottom: "1rem" }}>{language === "vi" ? "Danh sách nhóm cộng đồng" : "Community Group List"}</h3>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}><Loader2 style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : groups.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <Users size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <p style={{ color: "var(--text-secondary)" }}>{language === "vi" ? "Chưa có nhóm chat nào được tạo." : "No chat groups created yet."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {groups.map(group => (
            <div key={group.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

                {/* Group avatar with upload trigger */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--bg-secondary)", border: "2px solid var(--accent-primary)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {uploadingId === group.id ? (
                      <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--accent-primary)" }} />
                    ) : group.avatarUrl ? (
                      <img src={group.avatarUrl} alt={group.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Users size={24} style={{ color: "var(--text-secondary)" }} />
                    )}
                  </div>
                  <label
                    style={{ position: "absolute", bottom: "-2px", right: "-2px", background: "var(--accent-primary)", color: "white", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
                    title={language === "vi" ? "Đổi ảnh nhóm" : "Change group avatar"}
                  >
                    <Camera size={11} />
                    <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingId !== null}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(group.id, file); e.target.value = ""; }}
                    />
                  </label>
                </div>

                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.2rem" }}>{group.name}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{group.description || (language === "vi" ? "Không có mô tả" : "No description")}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button className="btn btn-secondary" onClick={() => handleEdit(group)}><Edit size={16} /></button>
                <button className="btn btn-secondary" style={{ color: "var(--danger)" }} onClick={() => handleDelete(group.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
