import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import styles from "./Topics.module.css";
import { useLanguage } from "../components/LanguageContext";
import { apiRequest, useAuth } from "../components/AuthContext";

export default function TestsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/tests")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTests(data);
        }
      })
      .catch((err) => console.error("Error fetching tests:", err))
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
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{t("tests.title")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
            {t("tests.desc")}
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Link to="/tests/create" className="btn btn-primary">
            {t("tests.create")}
          </Link>
        )}
      </div>

      {tests.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <CheckCircle size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3>{t("tests.empty.title")}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{t("tests.empty.desc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {tests.map((test) => (
            <Link to={`/tests/${test.id}`} key={test.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>{test.title}</h3>
                <span className={styles.badge}>{test.type}</span>
              </div>
              <p className={styles.description}>{test.description || t("topics.noDesc")}</p>
              <div className={styles.stats}>
                <span>{t("tests.topic")} {test.topic?.title || t("tests.general")}</span>
                <span>{test._count?.questions || 0} {t("tests.questions")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
