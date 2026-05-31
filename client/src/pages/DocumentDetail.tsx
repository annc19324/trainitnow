import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Calendar, User, BookOpen } from "lucide-react";
import { apiRequest } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext";
import styles from "../styles/Topics.module.css";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    apiRequest(`/api/documents/${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch document");
      })
      .then((data) => setDoc(data))
      .catch((err) => {
        console.error("Error fetching document details:", err);
        navigate("/documents");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDownload = async (e: React.MouseEvent, format: "docx" | "pdf") => {
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
      <div style={{ textAlign: "center", padding: "6rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>{t("home.comments.loading") || "Loading..."}</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <h2>{language === "vi" ? "Không tìm thấy tài liệu" : "Document not found"}</h2>
        <Link to="/documents" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          <ArrowLeft size={18} style={{ marginRight: "0.5rem" }} /> {language === "vi" ? "Quay lại" : "Go Back"}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem 0" }}>
      {/* Back navigation */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/documents" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} />
          <span>{language === "vi" ? "Danh sách tài liệu" : "Back to Documents"}</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="glass-panel" style={{ padding: "2.5rem", borderRadius: "1.25rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div>
                <span className={styles.badge} style={{ background: doc.type === "THEORY" ? "var(--primary)" : "var(--warning)", color: "white", padding: "0.25rem 0.75rem", fontSize: "0.8rem", fontWeight: 600 }}>
                  {doc.type}
                </span>
              </div>
              {doc.topic && (
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <BookOpen size={14} />
                  {doc.topic.title}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "1.55rem", fontWeight: 700, margin: 0, lineHeight: 1.3, color: "var(--text-primary)" }}>
              {doc.title}
            </h1>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button 
              onClick={(e) => handleDownload(e, "docx")}
              className="btn btn-primary" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                padding: "0.75rem 1.25rem", 
                fontSize: "0.95rem",
                background: "#2563eb",
                borderColor: "#2563eb",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
              }}
            >
              <Download size={18} />
              <span>Word (DOCX)</span>
            </button>
            <button 
              onClick={(e) => handleDownload(e, "pdf")}
              className="btn btn-secondary" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                padding: "0.75rem 1.25rem", 
                fontSize: "0.95rem",
                color: "#ef4444",
                borderColor: "#ef4444",
                background: "transparent",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)"
              }}
            >
              <Download size={18} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Metadata row */}
        <div style={{ 
          display: "flex", 
          gap: "1.5rem", 
          fontSize: "0.85rem", 
          color: "var(--text-secondary)", 
          borderBottom: "1px solid var(--border-color)", 
          paddingBottom: "1.25rem",
          marginBottom: "2rem",
          flexWrap: "wrap"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <User size={14} />
            {language === "vi" ? "Đăng bởi" : "Uploaded by"}: <strong>{doc.user?.name || doc.user?.username}</strong>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={14} />
            {language === "vi" ? "Ngày đăng" : "Uploaded on"}: {new Date(doc.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        {/* Theory Content Area (Description) */}
        <div>
          <div 
            className="theory-rich-content"
            style={{ 
              background: "rgba(255, 255, 255, 0.02)", 
              border: "1px solid var(--border-color)",
              borderRadius: "0.75rem", 
              padding: "1.75rem 2rem",
              lineHeight: "1.7",
              fontSize: "1.05rem",
              color: "var(--text-primary)",
              overflowWrap: "anywhere",
              whiteSpace: "pre-wrap"
            }}
            dangerouslySetInnerHTML={{ 
              __html: doc.description || `<p style="color: var(--text-secondary); font-style: italic;">${language === "vi" ? "Chưa có nội dung mô tả chi tiết." : "No detailed description available."}</p>` 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
