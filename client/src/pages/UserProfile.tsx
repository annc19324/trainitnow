import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { User as UserIcon, Camera, Key, Save, Edit2, X, Check, Eye, EyeOff } from "lucide-react";
import { useAuth, apiRequest } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { language } = useLanguage();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchProfile = async () => {
    if (!username) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest(`/api/users/profile/${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setProfileUser(data);
      setName(data.name || "");
      setNewUsername(data.username || "");
      setEmail(data.email || "");
      setAvatarUrl(data.avatarUrl || null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(language === "vi" ? "Không tìm thấy người dùng" : "User not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    setIsEditing(false);
    setShowPasswordModal(false);
    setMessage(null);
  }, [username]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await apiRequest("/api/users/profile/avatar", { method: "POST", body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to upload avatar"); }
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      const updateRes = await apiRequest("/api/users/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: data.avatarUrl }),
      });
      const updateData = await updateRes.json();
      if (updateRes.ok) updateUser(updateData.user, updateData.token);
      setMessage({ text: language === "vi" ? "Tải ảnh đại diện lên thành công!" : "Avatar uploaded successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || (language === "vi" ? "Không thể tải ảnh lên" : "Failed to upload avatar"), type: "error" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !newUsername.trim() || !email.trim()) {
      setMessage({ text: language === "vi" ? "Vui lòng điền đầy đủ thông tin" : "Please fill out all required fields", type: "error" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiRequest("/api/users/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username: newUsername, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      updateUser(data.user, data.token);
      setProfileUser(data.user);
      setMessage({ text: language === "vi" ? "Cập nhật hồ sơ thành công!" : "Profile updated successfully!", type: "success" });
      setIsEditing(false);
      if (newUsername !== username) navigate(`/profile/${encodeURIComponent(newUsername)}`);
    } catch (err: any) {
      setMessage({ text: err.message || (language === "vi" ? "Không thể cập nhật hồ sơ" : "Failed to update profile"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) { setMessage({ text: language === "vi" ? "Vui lòng nhập mật khẩu hiện tại" : "Please enter your current password", type: "error" }); return; }
    if (newPassword !== confirmPassword) { setMessage({ text: language === "vi" ? "Mật khẩu mới không khớp" : "New passwords do not match", type: "error" }); return; }
    if (newPassword.length < 6) { setMessage({ text: language === "vi" ? "Mật khẩu mới phải từ 6 ký tự" : "New password must be at least 6 characters", type: "error" }); return; }
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiRequest("/api/users/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      updateUser(data.user, data.token);
      setMessage({ text: language === "vi" ? "Đổi mật khẩu thành công!" : "Password changed successfully!", type: "success" });
      closePasswordModal();
    } catch (err: any) {
      setMessage({ text: err.message || (language === "vi" ? "Không thể đổi mật khẩu" : "Failed to change password"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setShowCurrent(false); setShowNew(false); setShowConfirm(false);
  };

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  if (loading) return <div style={{ textAlign: "center", padding: "4rem" }}><p style={{ color: "var(--text-secondary)" }}>{language === "vi" ? "Đang tải hồ sơ..." : "Loading profile..."}</p></div>;

  if (error || !profileUser) return (
    <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", maxWidth: "500px", margin: "4rem auto" }}>
      <h3>Error</h3>
      <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>{error || "User not found"}</p>
      <Link to="/" className="btn btn-secondary" style={{ marginTop: "2rem" }}>{language === "vi" ? "Về trang chủ" : "Go Home"}</Link>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: "700px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div className="glass-panel" style={{ padding: "2.5rem", position: "relative" }}>

        {/* Top-right Edit button */}
        {isOwnProfile && !isEditing && (
          <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Edit2 size={16} /> {language === "vi" ? "Sửa hồ sơ" : "Edit Profile"}
            </button>
          </div>
        )}

        {/* Message Banner (only outside modal) */}
        {message && !showPasswordModal && (
          <div style={{
            padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "2rem",
            background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.type === "success" ? "var(--success, #10b981)" : "var(--danger)"}`,
            color: message.type === "success" ? "var(--success, #10b981)" : "var(--danger)",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            {message.type === "success" ? <Check size={18} /> : <X size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Avatar + Name Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2.5rem", textAlign: "center" }}>
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--bg-secondary)", border: "3px solid var(--accent-primary)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-lg)" }}>
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserIcon size={56} style={{ color: "var(--text-secondary)" }} />}
            </div>
            {isEditing && (
              <label style={{ position: "absolute", bottom: 0, right: 0, background: "var(--accent-primary)", color: "white", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} disabled={uploadingAvatar} />
              </label>
            )}
          </div>

          {!isEditing ? (
            <>
              <h1 className="gradient-text" style={{ fontSize: "2.2rem", marginBottom: "0.5rem", fontWeight: 700 }}>{profileUser.name}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>@{profileUser.username || profileUser.name?.toLowerCase().replace(/\s+/g, '')}</p>
              {profileUser.email && <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>{profileUser.email}</p>}
              <span style={{ padding: "0.3rem 1.25rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600", background: profileUser.role === "ADMIN" ? "var(--warning)" : "var(--success)", color: "white", marginTop: "1.25rem" }}>
                {profileUser.role}
              </span>
              {isOwnProfile && (
                <button
                  onClick={() => { setMessage(null); setShowPasswordModal(true); }}
                  style={{ marginTop: "1.5rem", background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem", opacity: 0.8, transition: "opacity 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "0.8")}
                >
                  <Key size={14} /> {language === "vi" ? "Đổi mật khẩu" : "Change Password"}
                </button>
              )}
            </>
          ) : (
            <h2 style={{ fontSize: "1.5rem" }}>{language === "vi" ? "Chỉnh sửa thông tin cá nhân" : "Edit Profile Info"}</h2>
          )}
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>{language === "vi" ? "Họ và tên" : "Full Name"} <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>{language === "vi" ? "Tên người dùng" : "Username"} <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>{language === "vi" ? "Địa chỉ Email" : "Email Address"} <span style={{ color: "var(--danger)" }}>*</span></label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} disabled={saving || uploadingAvatar}>
                <Save size={18} /> {saving ? (language === "vi" ? "Đang lưu..." : "Saving...") : (language === "vi" ? "Lưu thay đổi" : "Save Changes")}
              </button>
              <button type="button" className="btn btn-secondary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
                onClick={() => { setIsEditing(false); setName(profileUser.name || ""); setNewUsername(profileUser.username || ""); setEmail(profileUser.email || ""); setAvatarUrl(profileUser.avatarUrl || null); setMessage(null); }}
                disabled={saving || uploadingAvatar}>
                <X size={18} /> {language === "vi" ? "Hủy bỏ" : "Cancel"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Change Password Modal ─── */}
      {showPasswordModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closePasswordModal(); }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}
        >
          <div className="animate-fade-in" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2.5rem", width: "100%", maxWidth: "420px", margin: "1rem", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Key size={20} /> {language === "vi" ? "Đổi mật khẩu" : "Change Password"}
              </h3>
              <button onClick={closePasswordModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={20} /></button>
            </div>

            {/* Inline message */}
            {message && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${message.type === "success" ? "var(--success, #10b981)" : "var(--danger)"}`, color: message.type === "success" ? "var(--success, #10b981)" : "var(--danger)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {message.type === "success" ? <Check size={16} /> : <X size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Current */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>{language === "vi" ? "Mật khẩu hiện tại" : "Current Password"}</label>
                <div style={{ position: "relative" }}>
                  <input type={showCurrent ? "text" : "password"} className="input-field" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ paddingRight: "2.75rem" }} required />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* New */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>{language === "vi" ? "Mật khẩu mới" : "New Password"}</label>
                <div style={{ position: "relative" }}>
                  <input type={showNew ? "text" : "password"} className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ paddingRight: "2.75rem" }} placeholder={language === "vi" ? "Tối thiểu 6 ký tự" : "Min. 6 characters"} required />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>{language === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirm ? "text" : "password"} className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ paddingRight: "2.75rem" }} required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? (language === "vi" ? "Đang lưu..." : "Saving...") : (language === "vi" ? "Xác nhận đổi mật khẩu" : "Confirm Change")}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closePasswordModal} disabled={saving}>
                  {language === "vi" ? "Hủy" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
