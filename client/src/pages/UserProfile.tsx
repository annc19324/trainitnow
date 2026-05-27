import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { User as UserIcon, Camera, Save, Edit2, X, Check } from "lucide-react";
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
    setMessage(null);

    const trimmedName = name.trim();
    const trimmedUsername = newUsername.trim();
    const trimmedEmail = email.trim();

    // 1. Validate Name
    if (!trimmedName) {
      setMessage({ text: language === "vi" ? "Họ và tên không được để trống" : "Full name cannot be empty", type: "error" });
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setMessage({ text: language === "vi" ? "Họ và tên phải từ 2 đến 50 ký tự" : "Full name must be between 2 and 50 characters", type: "error" });
      return;
    }

    // 2. Validate Username
    if (!trimmedUsername) {
      setMessage({ text: language === "vi" ? "Tên tài khoản không được để trống" : "Username cannot be empty", type: "error" });
      return;
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setMessage({ text: language === "vi" ? "Tên tài khoản phải từ 3 đến 20 ký tự" : "Username must be between 3 and 20 characters", type: "error" });
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setMessage({
        text: language === "vi" 
          ? "Tên tài khoản chỉ được chứa chữ cái, chữ số, dấu gạch dưới (_) và dấu chấm (.)" 
          : "Username can only contain letters, numbers, underscores (_), and dots (.)",
        type: "error"
      });
      return;
    }

    // 3. Validate Email
    if (!trimmedEmail) {
      setMessage({ text: language === "vi" ? "Email không được để trống" : "Email cannot be empty", type: "error" });
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMessage({ text: language === "vi" ? "Định dạng email không hợp lệ" : "Invalid email address format", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest("/api/users/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, username: trimmedUsername, email: trimmedEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      updateUser(data.user, data.token);
      setProfileUser(data.user);
      setMessage({ text: language === "vi" ? "Cập nhật hồ sơ thành công!" : "Profile updated successfully!", type: "success" });
      setIsEditing(false);
      if (trimmedUsername !== username) navigate(`/profile/${encodeURIComponent(trimmedUsername)}`);
    } catch (err: any) {
      setMessage({ text: err.message || (language === "vi" ? "Không thể cập nhật hồ sơ" : "Failed to update profile"), type: "error" });
    } finally {
      setSaving(false);
    }
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

        {/* Message Banner */}
        {message && (
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


    </div>
  );
}
