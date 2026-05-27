import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import styles from "../styles/Auth.module.css";
import { useLanguage } from "../components/LanguageContext";
import { useAuth } from "../components/AuthContext";

export default function Login() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError(language === "vi" ? "Email hoặc tên tài khoản không được để trống" : "Email or username cannot be empty");
      return;
    }
    if (trimmedEmail.length < 3) {
      setError(language === "vi" ? "Email hoặc tên tài khoản phải có ít nhất 3 ký tự" : "Email or username must be at least 3 characters");
      return;
    }
    if (!trimmedPassword) {
      setError(language === "vi" ? "Mật khẩu không được để trống" : "Password cannot be empty");
      return;
    }
    if (trimmedPassword.length < 6) {
      setError(language === "vi" ? "Mật khẩu phải từ 6 ký tự" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`glass-panel ${styles.authCard} animate-fade-in`}>
        <h2 className="gradient-text" style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
          {t("auth.login.title")}
        </h2>
        {error && <div className={styles.errorAlert}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>{t("auth.label.emailOrUsername")}</label>
            <input 
              type="text" 
              className="input-field" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{t("auth.label.password")}</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                style={{ paddingRight: "2.5rem" }}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                className={styles.eyeIcon} 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
              <Link to="/forgot-password" tabIndex={-1} style={{ fontSize: "0.8rem", color: "var(--accent-primary)" }}>
                {t("auth.link.forgot")}
              </Link>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? t("auth.login.signingIn") : t("auth.login.btn")}
          </button>
        </form>
        <p className={styles.authFooter}>
          {t("auth.login.footer")} <Link to="/register">{t("auth.register.btn")}</Link>
        </p>
      </div>
    </div>
  );
}
