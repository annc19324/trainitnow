import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import styles from "./Topics.module.css";
import { useLanguage } from "../components/LanguageContext";
import { apiRequest } from "../components/AuthContext";

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDocuments(data);
        }
      })
      .catch((err) => console.error("Error fetching documents:", err))
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
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{t("docs.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
          {t("docs.desc")}
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <FileText size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3>{t("docs.empty.title")}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{t("docs.empty.desc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {documents.map((doc) => (
            <div key={doc.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>{doc.title}</h3>
                <span className={styles.badge}>{doc.type}</span>
              </div>
              <p className={styles.description}>{doc.description || t("topics.noDesc")}</p>
              <div className={styles.stats} style={{ justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("tests.topic")} {doc.topic?.title || t("tests.general")}</span>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                  <Download size={14} style={{ marginRight: "0.25rem" }} /> {t("docs.download")}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
