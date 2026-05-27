import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/Admin.module.css";
import { useLanguage } from "../../components/LanguageContext";
import { apiRequest } from "../../components/AuthContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({
    topicCount: 0,
    testCount: 0,
    documentCount: 0,
    userCount: 0,
    historyCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/admin/counts")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCounts({
            topicCount: data.topicCount || 0,
            testCount: data.testCount || 0,
            documentCount: data.documentCount || 0,
            userCount: data.userCount || 0,
            historyCount: data.historyCount || 0,
          });
        }
      })
      .catch(err => console.error("Error fetching admin stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading dashboard...</p>
      </div>
    );
  }

  const cards = [
    { label: t("admin.users"),      count: counts.userCount,     to: "/admin/users",     btnLabel: "Quản lý" },
    { label: t("admin.topics"),     count: counts.topicCount,    to: "/admin/topics",    btnLabel: "Quản lý" },
    { label: t("admin.tests"),      count: counts.testCount,     to: "/admin/tests",     btnLabel: "Quản lý" },
    { label: t("admin.documents"),  count: counts.documentCount, to: "/admin/documents", btnLabel: "Quản lý" },
    { label: "Lịch sử làm bài",    count: counts.historyCount,  to: "/admin/history",   btnLabel: "Xem" },
  ];

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className="gradient-text">{t("admin.title")}</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {cards.map(card => (
          <div key={card.to} className={`glass-panel ${styles.statCard}`}
            style={{ padding: "1.25rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <p className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1 }}>{card.count}</p>
            <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500, margin: 0 }}>{card.label}</h3>
            <Link to={card.to} className="btn btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {card.btnLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
