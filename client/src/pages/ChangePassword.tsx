import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Key, Eye, EyeOff, Check, X, Save } from "lucide-react";
import { useAuth, apiRequest } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext";

export default function ChangePassword() {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({
        text: language === "vi" ? "Vui lòng nhập mật khẩu hiện tại" : "Please enter your current password",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({
        text: language === "vi" ? "Mật khẩu mới không khớp" : "New passwords do not match",
        type: "error",
      });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        text: language === "vi" ? "Mật khẩu mới phải từ 6 ký tự" : "New password must be at least 6 characters",
        type: "error",
      });
      return;
    }

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
      setMessage({
        text: language === "vi" ? "Đổi mật khẩu thành công!" : "Password changed successfully!",
        type: "success",
      });
      
      // Clear inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Auto redirect after success
      setTimeout(() => {
        navigate(`/profile/${encodeURIComponent(user.username || user.name)}`);
      }, 1500);
    } catch (err: any) {
      setMessage({
        text: err.message || (language === "vi" ? "Không thể đổi mật khẩu" : "Failed to change password"),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "500px", margin: "2rem auto", paddingBottom: "4rem" }}>
      <div className="glass-panel" style={{ padding: "2.5rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            borderRadius: "50%", 
            background: "rgba(30, 58, 138, 0.1)", 
            border: "2px solid var(--accent-primary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "1rem",
            color: "var(--accent-primary)"
          }}>
            <Key size={30} />
          </div>
          <h2 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            {language === "vi" ? "Đổi Mật Khẩu" : "Change Password"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            {language === "vi" ? "Cập nhật mật khẩu bảo vệ tài khoản của bạn" : "Update your password to keep your account secure"}
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div style={{
            padding: "1rem", 
            borderRadius: "var(--radius-md)", 
            marginBottom: "1.5rem",
            background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.type === "success" ? "var(--success, #10b981)" : "var(--danger)"}`,
            color: message.type === "success" ? "var(--success, #10b981)" : "var(--danger)",
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            fontSize: "0.9rem"
          }}>
            {message.type === "success" ? <Check size={18} /> : <X size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Current Password */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>
              {language === "vi" ? "Mật khẩu hiện tại" : "Current Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input 
                type={showCurrent ? "text" : "password"} 
                className="input-field" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                style={{ paddingRight: "2.75rem" }} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)} 
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>
              {language === "vi" ? "Mật khẩu mới" : "New Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input 
                type={showNew ? "text" : "password"} 
                className="input-field" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ paddingRight: "2.75rem" }} 
                placeholder={language === "vi" ? "Tối thiểu 6 ký tự" : "Min. 6 characters"} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>
              {language === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input 
                type={showConfirm ? "text" : "password"} 
                className="input-field" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={{ paddingRight: "2.75rem" }} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center" }} 
              disabled={saving}
            >
              <Save size={18} />
              {saving 
                ? (language === "vi" ? "Đang lưu..." : "Saving...") 
                : (language === "vi" ? "Lưu mật khẩu" : "Save Password")}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate(`/profile/${encodeURIComponent(user.username || user.name)}`)}
              disabled={saving}
            >
              {language === "vi" ? "Quay lại" : "Back"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
