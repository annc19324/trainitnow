import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import styles from "../styles/Auth.module.css";
import { useLanguage } from "../components/LanguageContext";
import { useAuth } from "../components/AuthContext";

export default function Register() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Validate Name
    if (!trimmedName) {
      setError(language === "vi" ? "Họ và tên không được để trống" : "Full name cannot be empty");
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError(language === "vi" ? "Họ và tên phải từ 2 đến 50 ký tự" : "Full name must be between 2 and 50 characters");
      return;
    }

    // 2. Validate Username
    if (!trimmedUsername) {
      setError(language === "vi" ? "Tên tài khoản không được để trống" : "Username cannot be empty");
      return;
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setError(language === "vi" ? "Tên tài khoản phải từ 3 đến 20 ký tự" : "Username must be between 3 and 20 characters");
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setError(
        language === "vi" 
          ? "Tên tài khoản chỉ được chứa chữ cái, chữ số, dấu gạch dưới (_) và dấu chấm (.)" 
          : "Username can only contain letters, numbers, underscores (_), and dots (.)"
      );
      return;
    }

    // 3. Validate Email
    if (!trimmedEmail) {
      setError(language === "vi" ? "Email không được để trống" : "Email cannot be empty");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(language === "vi" ? "Định dạng email không hợp lệ" : "Invalid email address format");
      return;
    }

    // 4. Validate Password
    if (!trimmedPassword) {
      setError(language === "vi" ? "Mật khẩu không được để trống" : "Password cannot be empty");
      return;
    }
    if (trimmedPassword.length < 6) {
      setError(language === "vi" ? "Mật khẩu phải có ít nhất 6 ký tự" : "Password must be at least 6 characters");
      return;
    }
    if (/\s/.test(trimmedPassword)) {
      setError(language === "vi" ? "Mật khẩu không được chứa khoảng trắng" : "Password cannot contain spaces");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: trimmedName, 
          username: trimmedUsername, 
          email: trimmedEmail, 
          password: trimmedPassword 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically log the user in
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
          {t("auth.register.title")}
        </h2>
        {error && <div className={styles.errorAlert}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>{t("auth.label.name")}</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>{t("auth.label.username")}</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
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
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? t("auth.register.registering") : t("auth.register.btn")}
          </button>
        </form>
        <p className={styles.authFooter}>
          {t("auth.register.footer")} <Link to="/login">{t("auth.login.btn")}</Link>
        </p>
      </div>
    </div>
  );
}
