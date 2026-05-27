import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Auth.module.css";
import { useLanguage } from "../components/LanguageContext";

export default function ForgotPassword() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [demoMessage, setDemoMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDemoMessage("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi khôi phục mật khẩu.");
      }

      setSuccess(true);
      if (data.demoMode && data.tempPassword) {
        setDemoMessage(
          language === "vi"
            ? `[CHẾ ĐỘ THỬ NGHIỆM - SMTP chưa cấu hình]\nMật khẩu tạm thời mới là: ${data.tempPassword}`
            : `[DEMO MODE - SMTP not configured]\nYour temporary password is: ${data.tempPassword}`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`glass-panel ${styles.authCard} animate-fade-in`}>
        <h2 className="gradient-text" style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
          {t("auth.forgot.title")}
        </h2>
        
        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)", border: "1px solid var(--danger)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--success)", marginBottom: "2rem", fontWeight: 600 }}>
              {t("auth.forgot.success")}
            </p>
            {demoMessage && (
              <pre style={{ 
                background: "rgba(0,0,0,0.05)", 
                padding: "1rem", 
                borderRadius: "var(--radius-md)", 
                marginBottom: "2rem",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                borderLeft: "4px solid var(--accent-primary)"
              }}>
                {demoMessage}
              </pre>
            )}
            <Link to="/login" className="btn btn-primary" style={{ width: "100%", display: "block", textAlign: "center" }}>
              {t("auth.forgot.return")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
              {t("auth.forgot.desc")}
            </p>
            <div className={styles.inputGroup}>
              <label>{t("auth.label.email")}</label>
              <input 
                type="email" 
                className="input-field" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? t("auth.forgot.sending") : t("auth.forgot.btn")}
            </button>
          </form>
        )}
        
        {!success && (
          <p className={styles.authFooter}>
            {t("auth.forgot.footer")} <Link to="/login">{t("auth.login.btn")}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
