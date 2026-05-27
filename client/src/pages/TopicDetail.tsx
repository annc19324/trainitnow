import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, FileText } from "lucide-react";
import styles from "./Topics.module.css";
import { apiRequest } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext";

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiRequest(`/api/topics/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Topic not found");
        return res.json();
      })
      .then((data) => {
        setTopic(data);
      })
      .catch((err) => {
        console.error("Error loading topic:", err);
        setError("Failed to load topic details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>{t("home.comments.loading") || "Loading..."}</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", maxWidth: "600px", margin: "4rem auto" }}>
        <h3>Error</h3>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>{error || "Topic not found"}</p>
        <Link to="/topics" className="btn btn-secondary" style={{ marginTop: "2rem" }}>
          Back to Topics
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{topic.title}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>{topic.description}</p>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
        <section>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <FileText size={24} color="var(--accent-primary)" /> Documents & Theory
          </h2>
          {!topic.documents || topic.documents.length === 0 ? (
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No documents available for this topic.
            </div>
          ) : (
            <div className={styles.grid}>
              {topic.documents.map((doc: any) => (
                <div key={doc.id} className={`glass-panel ${styles.card}`}>
                  <h3 style={{ marginBottom: "0.5rem" }}>{doc.title}</h3>
                  <p className={styles.description}>{doc.description}</p>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    View Document
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <CheckCircle size={24} color="var(--accent-secondary)" /> Practice Tests
          </h2>
          {!topic.tests || topic.tests.length === 0 ? (
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No tests available for this topic.
            </div>
          ) : (
            <div className={styles.grid}>
              {topic.tests.map((test: any) => (
                <Link to={`/tests/${test.id}`} key={test.id} className={`glass-panel ${styles.card}`}>
                  <h3 style={{ marginBottom: "0.5rem" }}>{test.title}</h3>
                  <p className={styles.description}>{test.description}</p>
                  <span className="btn btn-primary" style={{ marginTop: "auto", alignSelf: "flex-start" }}>
                    Take Test
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
