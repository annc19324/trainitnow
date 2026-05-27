import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../components/LanguageContext";
import { BookOpen, Plus, Trash2, Edit } from "lucide-react";
import { useAuth, apiRequest } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSets = async () => {
    try {
      const res = await apiRequest(`/api/flashcards`);
      if (res.ok) {
        const data = await res.json();
        setSets(data);
      }
    } catch (error) {
      console.error("Failed to fetch flashcard sets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!user) {
      alert(language === 'vi' ? 'Vui lòng đăng nhập để tạo bộ thẻ!' : 'Please log in to create a set!');
      return;
    }
    setSubmitting(true);
    
    try {
      const res = await apiRequest("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          flashcards: []
        }),
      });

      if (res.ok) {
        const newSet = await res.json();
        setSets([newSet, ...sets]);
        setNewTitle("");
        setNewDesc("");
        setShowCreateForm(false);
        navigate(`/flashcards/${newSet.id}/edit`);
      }
    } catch (error) {
      console.error("Failed to create flashcard set", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast(language === 'vi' ? 'Vui lòng đăng nhập!' : 'Please log in!', 'error');
      return;
    }
    
    try {
      const res = await apiRequest(`/api/flashcards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSets(sets.filter(s => s.id !== id));
        showToast(language === 'vi' ? 'Đã xóa bộ thẻ thành công!' : 'Deleted flashcard set successfully!', 'success');
      } else {
        showToast(language === 'vi' ? 'Không thể xóa bộ thẻ!' : 'Failed to delete flashcard set!', 'error');
      }
    } catch (error) {
      console.error("Failed to delete", error);
      showToast(language === 'vi' ? 'Lỗi hệ thống khi xóa bộ thẻ!' : 'System error deleting flashcard set!', 'error');
    }
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div className="container" style={{ padding: "4rem 1rem", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            {t("nav.flashcards")}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {language === 'vi' ? 'Tạo và học từ vựng với thẻ ghi nhớ' : 'Create and learn vocabulary with flashcards'}
          </p>
        </div>
        {user ? (
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={18} /> {language === 'vi' ? 'Tạo bộ thẻ' : 'Create Set'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            {language === 'vi' ? 'Đăng nhập để tạo bộ thẻ' : 'Log in to create set'}
          </button>
        )}
      </div>

      {showCreateForm && user && (
        <form onSubmit={handleCreate} style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-lg)", marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>{language === 'vi' ? 'Tạo bộ thẻ mới' : 'Create New Set'}</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>{language === 'vi' ? 'Tiêu đề' : 'Title'}</label>
            <input 
              type="text" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-field" 
              required
              placeholder={language === 'vi' ? 'VD: Từ vựng tiếng Anh giao tiếp' : 'Ex: Basic English Vocabulary'}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>{language === 'vi' ? 'Mô tả (không bắt buộc)' : 'Description (Optional)'}</label>
            <textarea 
              value={newDesc} 
              onChange={(e) => setNewDesc(e.target.value)}
              className="input-field" 
              rows={3}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (language === 'vi' ? 'Đang tạo...' : 'Creating...') : (language === 'vi' ? 'Tạo' : 'Create')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {sets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)" }}>
          <BookOpen size={48} style={{ margin: "0 auto 1rem", color: "var(--text-secondary)" }} />
          <h3>{language === 'vi' ? 'Chưa có bộ thẻ nào' : 'No flashcard sets yet'}</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            {language === 'vi' ? 'Bắt đầu bằng cách tạo bộ thẻ đầu tiên của bạn.' : 'Start by creating your first set.'}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {sets.map(set => (
            <div key={set.id} style={{ 
              background: "var(--bg-secondary)", 
              borderRadius: "var(--radius-lg)", 
              padding: "1.5rem",
              border: "1px solid var(--border-color)",
              transition: "transform 0.2s, box-shadow 0.2s",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              cursor: "pointer"
            }} onClick={() => navigate(`/flashcards/${set.id}`)}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              
              <h3 style={{ marginBottom: "0.5rem", paddingRight: "4rem" }}>{set.title}</h3>
              {set.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem", flex: 1 }}>
                  {set.description}
                </p>
              )}
              
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, background: "rgba(0,0,0,0.2)", padding: "0.2rem 0.5rem", borderRadius: "1rem" }}>
                  {set._count?.flashcards || 0} {language === 'vi' ? 'thẻ' : 'cards'}
                </span>
                
                {user && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/flashcards/${set.id}/edit`); }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "0.2rem" }}
                      title={language === 'vi' ? 'Sửa' : 'Edit'}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(set.id, e)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--danger)", padding: "0.2rem" }}
                      title={language === 'vi' ? 'Xóa' : 'Delete'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
