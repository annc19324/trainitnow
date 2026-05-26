"use client";

import styles from "./admin.module.css";
import { useLanguage } from "@/components/LanguageContext";

export default function AdminClient({ counts }: { counts: any }) {
  const { t } = useLanguage();
  const { topicCount, testCount, documentCount, userCount, historyCount } = counts;

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>{t("admin.title")}</h1>
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>{t("admin.users")}</h3>
          <p className="gradient-text">{userCount}</p>
          <a href="/admin/users" className="btn btn-secondary" style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Manage Users</a>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>{t("admin.topics")}</h3>
          <p className="gradient-text">{topicCount}</p>
          <a href="/admin/topics" className="btn btn-secondary" style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Manage Topics</a>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>{t("admin.tests")}</h3>
          <p className="gradient-text">{testCount}</p>
          <a href="/admin/tests" className="btn btn-secondary" style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Manage Tests</a>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>{t("admin.documents")}</h3>
          <p className="gradient-text">{documentCount}</p>
          <a href="/admin/documents" className="btn btn-secondary" style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Manage Documents</a>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Lịch sử làm bài</h3>
          <p className="gradient-text">{historyCount}</p>
          <a href="/admin/history" className="btn btn-secondary" style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>View History</a>
        </div>
      </div>
    </div>
  );
}

