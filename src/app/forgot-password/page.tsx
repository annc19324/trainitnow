"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../login/auth.module.css";
import { useLanguage } from "@/components/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement API call to send reset email via Nodemailer
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.authContainer}>
      <div className={`glass-panel ${styles.authCard} animate-fade-in`}>
        <h2 className="gradient-text" style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
          {t("auth.forgot.title")}
        </h2>
        
        {success ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--success)", marginBottom: "2rem" }}>
              {t("auth.forgot.success")}
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: "100%", display: "block", textAlign: "center" }}>
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
            {t("auth.forgot.footer")} <Link href="/login">{t("auth.login.btn")}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
