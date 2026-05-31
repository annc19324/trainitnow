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

  const handleDownload = async (e: React.MouseEvent, doc: any, format: "docx" | "pdf") => {
    e.stopPropagation();
    e.preventDefault();

    if (format === "pdf" && !doc.fileUrl.toLowerCase().endsWith(".pdf")) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      
      const htmlContent = `
        <html>
          <head>
            <title>${doc.title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Montserrat', sans-serif;
                color: #0f172a;
                line-height: 1.6;
                padding: 3rem;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 1.5rem;
                margin-bottom: 2rem;
              }
              .title {
                font-size: 2rem;
                font-weight: 700;
                color: #1e3a8a;
                margin: 0 0 0.5rem 0;
              }
              .meta {
                font-size: 0.875rem;
                color: #64748b;
                display: flex;
                gap: 1.5rem;
              }
              .content {
                font-size: 1.05rem;
              }
              h1, h2, h3 {
                color: #1e3a8a;
                margin-top: 1.5rem;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${doc.title}</h1>
              <div class="meta">
                <span>Category: ${doc.type}</span>
                <span>Topic: ${doc.topic?.title || "General"}</span>
              </div>
            </div>
            <div class="content">
              ${doc.description || "<p>No content available.</p>"}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      return;
    }

    try {
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const safeTitle = doc.title.replace(/[/\\?%*:|"<>]/g, '-');
      link.download = `${safeTitle}.${format}`;
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
                <div className={styles.stats} style={{ justifyContent: "space-between", alignItems: "center", marginTop: "auto", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span>{t("tests.topic")} {doc.topic?.title || t("tests.general")}</span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", background: "#2563eb", borderColor: "#2563eb" }}
                      onClick={(e) => handleDownload(e, doc, "docx")}
                    >
                      <Download size={12} style={{ marginRight: "0.25rem" }} /> Word
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "#ef4444", borderColor: "#ef4444", background: "transparent" }}
                      onClick={(e) => handleDownload(e, doc, "pdf")}
                    >
                      <Download size={12} style={{ marginRight: "0.25rem" }} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
