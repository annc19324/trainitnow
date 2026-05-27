import { useState, useEffect, useRef } from "react";
import styles from "./Admin.module.css";
import { UploadCloud, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { apiRequest } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import { useLanguage } from "../components/LanguageContext";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { showToast } = useToast();
  const { language } = useLanguage();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"THEORY" | "EXERCISE">("THEORY");
  const [topicId, setTopicId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchTopics();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await apiRequest("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } finally {
      setFetching(false);
    }
  };

  const fetchTopics = async () => {
    const res = await apiRequest("/api/topics");
    if (res.ok) {
      const data = await res.json();
      setTopics(data);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    if (topicId) formData.append("topicId", topicId);

    try {
      // For FormData, do not set "Content-Type" manually
      const res = await apiRequest("/api/documents", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        setTitle("");
        setDescription("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchDocuments();
      } else {
        const errData = await res.json();
        showToast(language === "vi" ? `Tải lên thất bại: ${errData.error || 'Lỗi không xác định'}` : `Upload failed: ${errData.error || 'Unknown error'}`, "error");
      }
    } catch (error: any) {
      showToast(language === "vi" ? `Lỗi tải lên: ${error.message || String(error)}` : `Error uploading file: ${error.message || String(error)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        showToast(language === "vi" ? "Đã xóa tài liệu thành công!" : "Deleted document successfully!", "success");
      } else {
        showToast(language === "vi" ? "Không thể xóa tài liệu!" : "Failed to delete document!", "error");
      }
    } catch (error) {
      showToast(language === "vi" ? "Lỗi hệ thống khi xóa tài liệu!" : "Error deleting document!", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className="gradient-text">Quản lý tài liệu</h1>
        <p>Tải lên và quản lý toàn bộ tài liệu học tập trên hệ thống.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Upload New Document</h3>
        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Title</label>
              <input 
                className="input-field" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Topic (Optional)</label>
              <select 
                className="input-field" 
                value={topicId} 
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">No Topic</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: "80px", resize: "vertical" }}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Type</label>
              <select 
                className="input-field" 
                value={type} 
                onChange={(e) => setType(e.target.value as "THEORY" | "EXERCISE")}
              >
                <option value="THEORY">Theory</option>
                <option value="EXERCISE">Exercise</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>File (PDF, Word, etc.)</label>
              <input 
                type="file"
                ref={fileInputRef}
                className="input-field"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading || !file} style={{ alignSelf: "flex-start", marginTop: "1rem" }}>
            <UploadCloud size={16} style={{ marginRight: "0.5rem" }} /> {loading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>

      {fetching ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <FileText size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3 style={{ marginBottom: "1rem" }}>No documents found</h3>
          <p style={{ color: "var(--text-secondary)" }}>Upload your first document above.</p>
        </div>
      ) : (
        <div className={styles.statsGrid} style={{ gridTemplateColumns: "1fr" }}>
          {documents.map(doc => (
            <div key={doc.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{doc.title}</h3>
                  <span style={{ 
                    padding: "0.15rem 0.5rem", 
                    borderRadius: "1rem", 
                    fontSize: "0.75rem", 
                    background: doc.type === "THEORY" ? "var(--primary)" : "var(--warning)",
                    color: "white"
                  }}>
                    {doc.type}
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>{doc.description}</p>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {doc.topic && <span>Topic: {doc.topic.title}</span>}
                  <span>Uploaded by {doc.user?.name || doc.user?.username}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" title="View File">
                  <LinkIcon size={18} />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
