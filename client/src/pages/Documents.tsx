import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download } from "lucide-react";
import styles from "../styles/Topics.module.css";
import { useLanguage } from "../components/LanguageContext";
import { apiRequest } from "../components/AuthContext";

export default function DocumentsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
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

  const handleDownload = async (e: React.MouseEvent, doc: any) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      
      let ext = "docx"; // default fallback
      const urlExt = doc.fileUrl.split('.').pop()?.toLowerCase();
      if (urlExt && ["pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "txt", "zip"].includes(urlExt)) {
        ext = urlExt;
      } else {
        const contentType = blob.type.toLowerCase();
        if (contentType.includes("pdf")) {
          ext = "pdf";
        } else if (contentType.includes("word") || contentType.includes("officedocument.wordprocessingml")) {
          ext = "docx";
        } else if (contentType.includes("excel") || contentType.includes("officedocument.spreadsheetml")) {
          ext = "xlsx";
        } else if (contentType.includes("presentation") || contentType.includes("officedocument.presentationml")) {
          ext = "pptx";
        }
      }
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const safeTitle = doc.title.replace(/[/\\?%*:|"<>]/g, '-');
      link.download = `${safeTitle}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(doc.fileUrl, "_blank");
    }
  };

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
          {documents.map((doc) => {
            const cleanDescription = doc.description 
              ? doc.description.replace(/<\/?[^>]+(>|$)/g, "") 
              : "";
            
            return (
              <div 
                key={doc.id} 
                className={`glass-panel ${styles.card}`}
                onClick={() => navigate(`/documents/${doc.id}`)}
                style={{ 
                  cursor: "pointer", 
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className={styles.cardHeader}>
                  <h3>{doc.title}</h3>
                  <span className={styles.badge}>{doc.type}</span>
                </div>
                <p className={styles.description} style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {cleanDescription || t("topics.noDesc")}
                </p>
                <div className={styles.stats} style={{ justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span>{t("tests.topic")} {doc.topic?.title || t("tests.general")}</span>
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary" 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    onClick={(e) => handleDownload(e, doc)}
                  >
                    <Download size={14} style={{ marginRight: "0.25rem" }} /> {t("docs.download")}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
