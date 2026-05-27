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
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const errors: typeof fieldErrors = {};

    if (!trimmedEmail) {
      errors.email = language === "vi" ? "Email hoặc tên tài khoản không được để trống" : "Email or username cannot be empty";
    } else if (trimmedEmail.length < 3) {
      errors.email = language === "vi" ? "Email hoặc tên tài khoản phải có ít nhất 3 ký tự" : "Email or username must be at least 3 characters";
    }

    if (!trimmedPassword) {
      errors.password = language === "vi" ? "Mật khẩu không được để trống" : "Password cannot be empty";
    } else if (trimmedPassword.length < 6) {
      errors.password = language === "vi" ? "Mật khẩu phải từ 6 ký tự" : "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
      const msg = err.message || "";
      const lower = msg.toLowerCase();
      
      // If unauthorized password mismatch or generic incorrect error
      if (lower.includes("password") || lower.includes("mật khẩu") || lower.includes("unauthorized") || lower.includes("sai")) {
        setFieldErrors({ password: language === "vi" ? "Mật khẩu nhập chưa chính xác" : "Incorrect password entered" });
      } else if (lower.includes("user") || lower.includes("email") || lower.includes("tài khoản")) {
        setFieldErrors({ email: language === "vi" ? "Tài khoản hoặc email này không tồn tại" : "This account or email does not exist" });
      } else {
        setFieldErrors({ general: msg });
      }
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
        
        {fieldErrors.general && <div className={styles.errorAlert}>{fieldErrors.general}</div>}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>{t("auth.label.emailOrUsername")}</label>
            <input 
              type="text" 
              className={`input-field ${fieldErrors.email ? styles.inputError : ""}`} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>
          
          <div className={styles.inputGroup}>
            <label>{t("auth.label.password")}</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                className={`input-field ${fieldErrors.password ? styles.inputError : ""}`} 
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
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
            
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
