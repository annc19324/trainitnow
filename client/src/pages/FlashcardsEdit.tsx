import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../components/LanguageContext";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "../components/AuthContext";

export default function EditFlashcardSetPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [flashcards, setFlashcards] = useState<{term: string, definition: string, id: string}[]>([]);
  
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchSet();
  }, [id]);

  const fetchSet = async () => {
    try {
      const res = await apiRequest(`/api/flashcards/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description || "");
        setFlashcards(data.flashcards.map((f: any) => ({ ...f, id: f.id || Math.random().toString() })));
        
        if (data.flashcards.length === 0) {
          setFlashcards([{ id: Math.random().toString(), term: "", definition: "" }]);
        }
      } else {
        navigate("/flashcards");
      }
    } catch (error) {
      console.error("Failed to fetch flashcard set", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setFlashcards([...flashcards, { id: Math.random().toString(), term: "", definition: "" }]);
  };

  const handleRemoveCard = (cardId: string) => {
    setFlashcards(flashcards.filter(f => f.id !== cardId));
  };

  const handleUpdateCard = (cardId: string, field: 'term' | 'definition', value: string) => {
    setFlashcards(flashcards.map(f => f.id === cardId ? { ...f, [field]: value } : f));
  };

  const handleQuickParse = () => {
    if (!quickPasteText.trim()) return;
    
    const blocks = quickPasteText.split(/\n\s*\n/);
    const newCards: any[] = [];
    
    blocks.forEach(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        let term = lines[0];
        let definition = lines[lines.length - 1];
        
        if (lines.length >= 3) {
          term = lines.slice(0, lines.length - 1).join('\n');
        }
        
        newCards.push({ id: Math.random().toString(), term, definition });
      }
    });
    
    if (newCards.length > 0) {
      if (flashcards.length === 1 && !flashcards[0].term && !flashcards[0].definition) {
        setFlashcards(newCards);
      } else {
        setFlashcards([...flashcards, ...newCards]);
      }
      setQuickPasteText("");
      setShowQuickPaste(false);
    } else {
      alert(language === 'vi' ? 'Không tìm thấy thẻ hợp lệ nào.' : 'No valid cards found.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert(language === 'vi' ? 'Vui lòng nhập tiêu đề' : 'Please enter a title');
      return;
    }

    const validCards = flashcards.filter(f => f.term.trim() && f.definition.trim());
    
    setSaving(true);
    try {
      const res = await apiRequest(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          flashcards: validCards
        })
      });

      if (res.ok) {
        navigate(`/flashcards/${id}`);
      } else {
        alert("Error saving");
      }
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: "4rem 1rem", minHeight: "80vh", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link to={`/flashcards`} className="btn btn-secondary" style={{ padding: "0.5rem" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ margin: 0, flex: 1 }}>{language === 'vi' ? 'Sửa bộ thẻ' : 'Edit Set'}</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu' : 'Save')}
        </button>
      </div>

      <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-lg)", marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>{language === 'vi' ? 'Tiêu đề' : 'Title'}</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="input-field" 
            placeholder={language === 'vi' ? 'Nhập tiêu đề' : 'Enter title'}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>{language === 'vi' ? 'Mô tả' : 'Description'}</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="input-field" 
            rows={2}
          />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>{language === 'vi' ? 'Các thẻ ghi nhớ' : 'Flashcards'}</h3>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowQuickPaste(!showQuickPaste)}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
          >
            {language === 'vi' ? 'Thêm nhanh (Dán)' : 'Quick Paste'}
          </button>
        </div>

        {showQuickPaste && (
          <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid var(--border-color)" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>{language === 'vi' ? 'Dán danh sách từ vựng' : 'Paste vocabulary list'}</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              {language === 'vi' 
                ? 'Mỗi thẻ cách nhau bằng một dòng trống. Dòng cuối cùng là nghĩa, các dòng trên là từ vựng/phiên âm.' 
                : 'Separate cards with a blank line. The last line is the definition, the ones above are term/pronunciation.'}
            </p>
            <textarea 
              className="input-field"
              rows={8}
              value={quickPasteText}
              onChange={(e) => setQuickPasteText(e.target.value)}
              placeholder={`artisan (n)\n/ˌɑːtɪˈzæn/\nthợ làm nghề thủ công\n\ncommunity (n)\n/kəˈmjuːnəti/\ncộng đồng`}
              style={{ fontFamily: "monospace", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-primary" onClick={handleQuickParse}>
                {language === 'vi' ? 'Tạo thẻ ngay' : 'Parse Cards'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowQuickPaste(false)}>
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
        
        {flashcards.map((card, index) => (
          <div key={card.id} style={{ 
            background: "var(--bg-secondary)", 
            padding: "1.5rem", 
            borderRadius: "var(--radius-lg)", 
            marginBottom: "1rem",
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <span style={{ fontWeight: 600 }}>{index + 1}</span>
              <button 
                onClick={() => handleRemoveCard(card.id)}
                style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  {language === 'vi' ? 'Thuật ngữ (Từ vựng)' : 'Term'}
                </label>
                <textarea 
                  value={card.term} 
                  onChange={(e) => handleUpdateCard(card.id, 'term', e.target.value)}
                  className="input-field" 
                  rows={2}
                  placeholder={language === 'vi' ? 'Nhập từ vựng...' : 'Enter term...'}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  {language === 'vi' ? 'Định nghĩa (Nghĩa)' : 'Definition'}
                </label>
                <textarea 
                  value={card.definition} 
                  onChange={(e) => handleUpdateCard(card.id, 'definition', e.target.value)}
                  className="input-field" 
                  rows={2}
                  placeholder={language === 'vi' ? 'Nhập định nghĩa...' : 'Enter definition...'}
                />
              </div>
            </div>
          </div>
        ))}

        <div 
          onClick={handleAddCard}
          style={{ 
            background: "var(--bg-secondary)", 
            padding: "2rem", 
            borderRadius: "var(--radius-lg)", 
            textAlign: "center",
            cursor: "pointer",
            border: "2px dashed var(--border-color)",
            marginTop: "1.5rem",
            color: "var(--primary)"
          }}
        >
          <Plus size={24} style={{ margin: "0 auto 0.5rem" }} />
          <div style={{ fontWeight: 500 }}>{language === 'vi' ? 'Thêm thẻ mới' : 'Add New Card'}</div>
        </div>
      </div>
    </div>
  );
}
