import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download } from "lucide-react";
import styles from "../styles/Topics.module.css";
import { useLanguage } from "../components/LanguageContext";
import { apiRequest } from "../components/AuthContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "800px";
      container.style.padding = "40px";
      container.style.background = "#ffffff";
      container.style.color = "#0f172a";
      container.style.fontFamily = "'Montserrat', sans-serif";
      container.style.lineHeight = "1.7";
      container.style.boxSizing = "border-box";

      container.innerHTML = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #1e3a8a; margin: 0 0 10px 0; font-family: 'Montserrat', sans-serif;">${doc.title}</h1>
          <div style="font-size: 13px; color: #64748b; display: flex; gap: 20px; font-family: 'Montserrat', sans-serif;">
            <span><strong>Category:</strong> ${doc.type}</span>
            <span><strong>Topic:</strong> ${doc.topic?.title || "General"}</span>
            <span><strong>Date:</strong> ${new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div style="font-size: 16px; color: #1e293b; font-family: 'Montserrat', sans-serif;">
          ${doc.description || "<p style='color: #64748b; font-style: italic;'>No description available.</p>"}
        </div>
      `;

      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const safeTitle = doc.title.replace(/[/\\?%*:|"<>]/g, '-');
        pdf.save(`${safeTitle}.pdf`);
      } catch (error) {
        console.error("PDF generation failed:", error);
        window.open(doc.fileUrl, "_blank");
      } finally {
        document.body.removeChild(container);
      }
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
