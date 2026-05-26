"use client";

import { BookOpen, Globe, Award } from "lucide-react";
import styles from "../page.module.css";
import { useLanguage } from "@/components/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "1rem" }}>{t("about.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>
          {t("about.desc")}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", marginBottom: "4rem" }}>
        <h2 className="gradient-text" style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>{t("about.creator")}</h2>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "700px", margin: "0 auto" }}>
          <p style={{ fontWeight: "bold", fontSize: "1.25rem", color: "var(--text-primary)" }}>Lê Thiên An</p>
          <p>Email: <a href="mailto:annc19324@gmail.com" style={{ color: "var(--accent-primary)" }}>annc19324@gmail.com</a></p>
          <p>{t("about.creator.find")} <strong style={{ color: "var(--text-primary)" }}>@annc19324</strong></p>
        </div>
      </div>

      <div className={styles.features} style={{ marginBottom: "4rem" }}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <BookOpen size={32} color="var(--accent-primary)" style={{ marginBottom: "1rem" }} />
          <h3>{t("about.f1.title")}</h3>
          <p>{t("about.f1.desc")}</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <Globe size={32} color="var(--success)" style={{ marginBottom: "1rem" }} />
          <h3>{t("about.f2.title")}</h3>
          <p>{t("about.f2.desc")}</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <Award size={32} color="var(--warning)" style={{ marginBottom: "1rem" }} />
          <h3>{t("about.f3.title")}</h3>
          <p>{t("about.f3.desc")}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
        <h2 className="gradient-text" style={{ fontSize: "2rem", marginBottom: "1rem" }}>{t("about.mission")}</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", lineHeight: "1.8", maxWidth: "700px", margin: "0 auto" }}>
          {t("about.mission.desc")}
        </p>
      </div>
    </div>
  );
}
