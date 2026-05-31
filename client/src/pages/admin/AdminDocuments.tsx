import { useState, useEffect, useRef } from "react";
import styles from "../../styles/Admin.module.css";
import { 
  UploadCloud, 
  Trash2, 
  FileText, 
  Download,
  Edit, 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Underline, 
  Highlighter, 
  List, 
  ListOrdered, 
  Palette, 
  Type,
  Eye,
  PenTool,
  X
} from "lucide-react";
import { apiRequest } from "../../components/AuthContext";
import { useToast } from "../../components/ToastContext";
import { useLanguage } from "../../components/LanguageContext";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { showToast } = useToast();
  const { language } = useLanguage();
  
  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"THEORY" | "EXERCISE">("THEORY");
  const [topicId, setTopicId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (!editingId && !file) {
      showToast(language === "vi" ? "Vui lòng chọn một tệp tin tài liệu!" : "Please select a document file!", "error");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("topicId", topicId || "");

    try {
      let res;
      if (editingId) {
        res = await apiRequest(`/api/documents/${editingId}`, {
          method: "PUT",
          body: formData
        });
      } else {
        res = await apiRequest("/api/documents", {
          method: "POST",
          body: formData
        });
      }
      
      if (res.ok) {
        showToast(
          language === "vi" 
            ? (editingId ? "Cập nhật tài liệu thành công!" : "Đăng tải tài liệu thành công!")
            : (editingId ? "Updated document successfully!" : "Uploaded document successfully!"),
          "success"
        );
        handleCancelEdit();
        fetchDocuments();
      } else {
        const errData = await res.json();
        showToast(
          language === "vi" 
            ? `Thất bại: ${errData.error || "Lỗi không xác định"}` 
            : `Failed: ${errData.error || "Unknown error"}`, 
          "error"
        );
      }
    } catch (error: any) {
      showToast(
        language === "vi" 
          ? `Lỗi: ${error.message || String(error)}` 
          : `Error: ${error.message || String(error)}`, 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === "vi" ? "Bạn có chắc chắn muốn xóa tài liệu này?" : "Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const res = await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        showToast(language === "vi" ? "Đã xóa tài liệu thành công!" : "Deleted document successfully!", "success");
        if (editingId === id) {
          handleCancelEdit();
        }
      } else {
        showToast(language === "vi" ? "Không thể xóa tài liệu!" : "Failed to delete document!", "error");
      }
    } catch (error) {
      showToast(language === "vi" ? "Lỗi hệ thống khi xóa tài liệu!" : "Error deleting document!", "error");
    }
  };

  const handleEditClick = (doc: any) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDescription(doc.description || "");
    setType(doc.type);
    setTopicId(doc.topicId || "");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveTab("write");
    
    // Set WYSIWYG editor content safely
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = doc.description || "";
      }
    }, 80);
    
    // Smooth scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setType("THEORY");
    setTopicId("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveTab("write");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  // Safe selection font-size wrapper to apply exact pixel sizes
  const changeSelectionFontSize = (size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    if (range.collapsed) return;
    
    const span = document.createElement("span");
    span.style.fontSize = size;
    
    try {
      range.surroundContents(span);
    } catch (e) {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleDownload = async (doc: any, format: "docx" | "pdf") => {
    // If PDF is requested and the original file is NOT a PDF, we can dynamically export the HTML notes to a beautifully formatted PDF!
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

    // Otherwise, fetch and download the original fileUrl
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

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
      <div className={styles.pageHeader}>
        <h1 className="gradient-text">
          {language === "vi" ? "Quản lý tài liệu" : "Document Management"}
        </h1>
      </div>
      
      {/* Editor & Upload form */}
      <div ref={formRef} className="glass-panel" style={{ padding: "2rem", marginBottom: "2.5rem", borderRadius: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 600 }}>
            {editingId 
              ? (language === "vi" ? "Sửa tài liệu thuyết trình/lý thuyết" : "Edit Document & Theory Notes")
              : (language === "vi" ? "Đăng tải tài liệu & Lý thuyết mới" : "Upload New Document & Theory")
            }
          </h3>
          {editingId && (
            <button 
              onClick={handleCancelEdit} 
              className="btn btn-secondary" 
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            >
              <X size={14} />
              <span>{language === "vi" ? "Hủy chỉnh sửa" : "Cancel Edit"}</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {language === "vi" ? "Tiêu đề tài liệu" : "Document Title"}
              </label>
              <input 
                className="input-field" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder={language === "vi" ? "Nhập tiêu đề..." : "Enter title..."}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {language === "vi" ? "Thuộc chuyên đề (Không bắt buộc)" : "Topic (Optional)"}
              </label>
              <select 
                className="input-field" 
                value={topicId} 
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">{language === "vi" ? "Không thuộc chuyên đề nào" : "No Topic"}</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Rich Text Editor for theory details */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
              <label style={{ fontWeight: 500, margin: 0 }}>
                {language === "vi" ? "Nội dung & Lý thuyết chi tiết (Mô tả)" : "Detailed Content & Theory (Description)"}
              </label>
              
              {/* Editor Tabs */}
              <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: "2px", borderRadius: "var(--radius-md)" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  style={{
                    background: activeTab === "write" ? "var(--primary)" : "transparent",
                    color: "white",
                    border: "none",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.8rem",
                    borderRadius: "calc(var(--radius-md) - 2px)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <PenTool size={12} />
                  <span>{language === "vi" ? "Biên soạn" : "Write"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  style={{
                    background: activeTab === "preview" ? "var(--primary)" : "transparent",
                    color: "white",
                    border: "none",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.8rem",
                    borderRadius: "calc(var(--radius-md) - 2px)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <Eye size={12} />
                  <span>{language === "vi" ? "Xem trước" : "Preview"}</span>
                </button>
              </div>
            </div>

            {/* WYSIWYG HTML Editor */}
            <div style={{ display: activeTab === "write" ? "flex" : "none", flexDirection: "column", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <style dangerouslySetInnerHTML={{__html: `
                .wysiwyg-editor:empty:before {
                  content: attr(data-placeholder);
                  color: var(--text-secondary);
                  opacity: 0.5;
                  cursor: text;
                  pointer-events: none;
                  display: block;
                }
              `}} />
              
              {/* Custom Rich Text Toolbar similar to Word */}
              <div style={{ 
                display: "flex", 
                gap: "0.25rem", 
                padding: "0.5rem", 
                background: "rgba(0,0,0,0.3)", 
                borderBottom: "1px solid var(--border-color)",
                flexWrap: "wrap",
                alignItems: "center"
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem", minWidth: "32px" }} 
                  title="Bold" 
                  onClick={() => {
                    document.execCommand('bold', false);
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Bold size={14} />
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem", minWidth: "32px" }} 
                  title="Italic" 
                  onClick={() => {
                    document.execCommand('italic', false);
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Italic size={14} />
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem", minWidth: "32px" }} 
                  title="Underline" 
                  onClick={() => {
                    document.execCommand('underline', false);
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Underline size={14} />
                </button>
                
                <div style={{ width: "1px", height: "20px", background: "var(--border-color)", margin: "0 0.25rem" }} />

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem", fontWeight: "bold" }} 
                  title="Heading 1" 
                  onClick={() => {
                    document.execCommand('formatBlock', false, '<h1>');
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Heading1 size={14} style={{ marginRight: "0.15rem" }} />H1
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem", fontWeight: "bold" }} 
                  title="Heading 2" 
                  onClick={() => {
                    document.execCommand('formatBlock', false, '<h2>');
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Heading2 size={14} style={{ marginRight: "0.15rem" }} />H2
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem", fontWeight: "bold" }} 
                  title="Heading 3" 
                  onClick={() => {
                    document.execCommand('formatBlock', false, '<h3>');
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Heading3 size={14} style={{ marginRight: "0.15rem" }} />H3
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} 
                  title="Normal Text" 
                  onClick={() => {
                    document.execCommand('formatBlock', false, '<p>');
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  Normal
                </button>

                <div style={{ width: "1px", height: "20px", background: "var(--border-color)", margin: "0 0.25rem" }} />

                {/* Bullet Lists */}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem", minWidth: "32px" }} 
                  title="Bullet List" 
                  onClick={() => {
                    document.execCommand('insertUnorderedList', false);
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <List size={14} />
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem", minWidth: "32px" }} 
                  title="Numbered List" 
                  onClick={() => {
                    document.execCommand('insertOrderedList', false);
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <ListOrdered size={14} />
                </button>

                <div style={{ width: "1px", height: "20px", background: "var(--border-color)", margin: "0 0.25rem" }} />

                {/* Highlight */}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem", minWidth: "32px" }} 
                  title="Highlight text"
                  onClick={() => {
                    document.execCommand('hiliteColor', false, 'rgba(234, 179, 8, 0.35)');
                    if (editorRef.current) setDescription(editorRef.current.innerHTML);
                  }}
                >
                  <Highlighter size={14} />
                </button>

                {/* High contrast text color selection dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", position: "relative" }}>
                  <Palette size={14} style={{ color: "var(--text-secondary)", marginLeft: "0.25rem" }} />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        document.execCommand('foreColor', false, e.target.value);
                        if (editorRef.current) setDescription(editorRef.current.innerHTML);
                        e.target.value = ""; // Reset dropdown
                      }
                    }}
                    className="input-field"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", width: "auto", height: "28px", margin: 0, background: "rgba(0,0,0,0.5)" }}
                  >
                    <option value="">{language === "vi" ? "Màu chữ" : "Color"}</option>
                    <option value="#3b82f6" style={{ color: "#3b82f6" }}>Primary Blue</option>
                    <option value="#ef4444" style={{ color: "#ef4444" }}>Red</option>
                    <option value="#10b981" style={{ color: "#10b981" }}>Green</option>
                    <option value="#8b5cf6" style={{ color: "#8b5cf6" }}>Purple</option>
                    <option value="#f59e0b" style={{ color: "#f59e0b" }}>Gold</option>
                    <option value="#f97316" style={{ color: "#f97316" }}>Orange</option>
                    <option value="#ffffff" style={{ color: "#ffffff" }}>White</option>
                  </select>
                </div>

                {/* Font Size select */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", position: "relative" }}>
                  <Type size={14} style={{ color: "var(--text-secondary)", marginLeft: "0.25rem" }} />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        changeSelectionFontSize(e.target.value);
                        e.target.value = ""; // Reset dropdown
                      }
                    }}
                    className="input-field"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", width: "auto", height: "28px", margin: 0, background: "rgba(0,0,0,0.5)" }}
                  >
                    <option value="">{language === "vi" ? "Cỡ chữ" : "Size"}</option>
                    <option value="12px">12 px</option>
                    <option value="14px">14 px</option>
                    <option value="16px">16 px</option>
                    <option value="18px">18 px</option>
                    <option value="20px">20 px</option>
                    <option value="24px">24 px</option>
                    <option value="28px">28 px</option>
                    <option value="32px">32 px</option>
                  </select>
                </div>
              </div>

              {/* contentEditable WYSIWYG Workspace */}
              <div 
                ref={editorRef}
                contentEditable
                className="wysiwyg-editor"
                style={{ 
                  minHeight: "380px", 
                  borderRadius: 0, 
                  border: "none", 
                  margin: 0,
                  padding: "1.25rem",
                  lineHeight: "1.7",
                  fontSize: "16px",
                  outline: "none",
                  background: "rgba(0,0,0,0.15)",
                  color: "var(--text-primary)",
                  overflowY: "auto",
                  textAlign: "left"
                }}
                data-placeholder={language === "vi" ? "Viết lý thuyết hay giáo trình tại đây. Bạn có thể sử dụng công cụ soạn thảo trực quan ở trên để thay đổi kích cỡ chữ, định dạng, bôi đậm, in nghiêng, đổi màu sắc và highlight trực tiếp..." : "Write detailed theory or syllabus content here. Select text to apply headings, bold, italic, highlight or custom exact pixel sizes..."}
                onInput={(e) => setDescription(e.currentTarget.innerHTML)}
              />
            </div>

            {/* Live Preview for parsed HTML */}
            <div 
              className="theory-rich-content"
              style={{ 
                display: activeTab === "preview" ? "block" : "none",
                minHeight: "414px", 
                border: "1px dashed var(--border-color)", 
                borderRadius: "var(--radius-md)", 
                padding: "1.5rem 2rem", 
                background: "rgba(255,255,255,0.02)",
                overflowY: "auto",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap"
              }}
              dangerouslySetInnerHTML={{ 
                __html: description || `<p style="color: var(--text-secondary); font-style: italic; text-align: center; margin-top: 4rem;">${language === "vi" ? "Chưa có nội dung lý thuyết để hiển thị." : "No theory contents to display."}</p>` 
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {language === "vi" ? "Phân loại" : "Category Type"}
              </label>
              <select 
                className="input-field" 
                value={type} 
                onChange={(e) => setType(e.target.value as "THEORY" | "EXERCISE")}
              >
                <option value="THEORY">{language === "vi" ? "Lý thuyết" : "Theory"}</option>
                <option value="EXERCISE">{language === "vi" ? "Bài tập thực hành" : "Exercise"}</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {editingId 
                  ? (language === "vi" ? "Tệp đính kèm mới (Không bắt buộc)" : "New File (Optional)")
                  : (language === "vi" ? "Tệp đính kèm (PDF, Word, ppt...)" : "Attach File (PDF, Word, ppt...)")
                }
              </label>
              <input 
                type="file"
                ref={fileInputRef}
                className="input-field"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required={!editingId}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem" }}>
              <UploadCloud size={18} /> 
              <span>
                {loading 
                  ? (language === "vi" ? "Đang xử lý..." : "Processing...") 
                  : (editingId ? (language === "vi" ? "Lưu tài liệu" : "Save Changes") : (language === "vi" ? "Tải tài liệu lên" : "Upload Document"))
                }
              </span>
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>
                {language === "vi" ? "Hủy bỏ" : "Cancel"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Documents List */}
      <h3 style={{ fontSize: "1.35rem", fontWeight: 600, marginBottom: "1.25rem" }}>
        {language === "vi" ? "Danh sách tài liệu hiện có" : "Available Documents"}
      </h3>

      {fetching ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <FileText size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3>{language === "vi" ? "Không tìm thấy tài liệu" : "No documents found"}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{language === "vi" ? "Tải lên tài liệu lý thuyết đầu tiên của bạn ở trên." : "Upload your first theory document above."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {documents.map(doc => {
            const cleanDescription = doc.description 
              ? doc.description.replace(/<\/?[^>]+(>|$)/g, "") 
              : "";
            
            return (
              <div 
                key={doc.id} 
                className="glass-panel" 
                style={{ 
                  padding: "1.5rem", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                  background: editingId === doc.id ? "rgba(59, 130, 246, 0.08)" : "var(--bg-secondary)"
                }}
              >
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <h4 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 600 }}>{doc.title}</h4>
                    <span style={{ 
                      padding: "0.2rem 0.6rem", 
                      borderRadius: "1rem", 
                      fontSize: "0.75rem", 
                      fontWeight: 600,
                      background: doc.type === "THEORY" ? "var(--primary)" : "var(--warning)",
                      color: "white"
                    }}>
                      {doc.type === "THEORY" ? (language === "vi" ? "Lý thuyết" : "THEORY") : (language === "vi" ? "Bài tập" : "EXERCISE")}
                    </span>
                  </div>
                  <p style={{ 
                    color: "var(--text-secondary)", 
                    marginBottom: "0.75rem", 
                    fontSize: "0.9rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {cleanDescription || (language === "vi" ? "Không có nội dung mô tả." : "No description available.")}
                  </p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    {doc.topic && <span>Topic: <strong>{doc.topic.title}</strong></span>}
                    <span>{language === "vi" ? "Người đăng" : "By"}: <strong>{doc.user?.name || doc.user?.username}</strong></span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button 
                    onClick={() => handleDownload(doc, "docx")} 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem", color: "#3b82f6" }} 
                    title={language === "vi" ? "Tải xuống Word (DOCX)" : "Download Word (DOCX)"}
                  >
                    <FileText size={18} />
                  </button>
                  <button 
                    onClick={() => handleDownload(doc, "pdf")} 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem", color: "#ef4444" }} 
                    title={language === "vi" ? "Tải xuống PDF" : "Download PDF"}
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => handleEditClick(doc)} 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem", color: "var(--primary)" }} 
                    title={language === "vi" ? "Sửa tài liệu" : "Edit Document"}
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)} 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem", color: "var(--danger)" }} 
                    title={language === "vi" ? "Xóa tài liệu" : "Delete Document"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
