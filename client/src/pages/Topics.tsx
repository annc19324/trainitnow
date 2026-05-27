import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import styles from "./Topics.module.css";
import { useLanguage } from "../components/LanguageContext";
import { apiRequest } from "../components/AuthContext";

export default function TopicsPage() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/topics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Since the API returns topics without _count directly (or maybe it does now),
          // let's count resources.
          const formatted = data.map(topic => ({
            ...topic,
            _count: topic._count || { tests: 0, documents: 0 }
          }));
          setTopics(formatted);
        }
      })
      .catch((err) => console.error("Error fetching topics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>{t("home.comments.loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{t("topics.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
          {t("topics.desc")}
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <BookOpen size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3>{t("topics.empty.title")}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{t("topics.empty.desc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {topics.map((topic) => (
            <Link to={`/topics/${topic.id}`} key={topic.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>{topic.title}</h3>
                <span className={styles.badge}>
                  {(topic._count?.tests || 0) + (topic._count?.documents || 0)} {t("topics.resources")}
                </span>
              </div>
              <p className={styles.description}>{topic.description || t("topics.noDesc")}</p>
              <div className={styles.stats}>
                <span>{topic._count?.documents || 0} {t("admin.documents")}</span>
                <span>{topic._count?.tests || 0} {t("admin.tests")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
