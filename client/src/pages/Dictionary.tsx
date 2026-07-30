import { useState, useEffect } from "react";
import { Search, Volume2, Book, Clock, Trash2, ArrowRight } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useAuth, apiRequest } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";

export default function Dictionary() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await apiRequest("/api/dictionary/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    try {
      const res = await apiRequest("/api/dictionary/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
        showToast(language === 'vi' ? "Đã xóa lịch sử tra cứu" : "History cleared", "success");
      }
    } catch (err) {
      console.error("Error clearing history", err);
    }
  };

  const handleSearch = async (e?: React.FormEvent, wordToSearch?: string) => {
    if (e) e.preventDefault();
    const searchWord = (wordToSearch || query).trim().toLowerCase();
    if (!searchWord) return;

    if (!wordToSearch) {
      setQuery(searchWord);
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(language === 'vi' ? "Không tìm thấy từ này trong từ điển" : "Word not found in dictionary");
        }
        throw new Error(language === 'vi' ? "Có lỗi xảy ra khi tra từ" : "Error looking up word");
      }

      const data = await response.json();
      const entry = data[0];
      setResult(entry);

      // Save to history if logged in
      if (user) {
        let phonetic = entry.phonetic || "";
        if (!phonetic && entry.phonetics && entry.phonetics.length > 0) {
          phonetic = entry.phonetics.find((p: any) => p.text)?.text || "";
        }
        
        let meaning = "";
        if (entry.meanings && entry.meanings.length > 0) {
          meaning = entry.meanings[0].definitions[0].definition;
        }

        const saveRes = await apiRequest("/api/dictionary/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: searchWord,
            phonetic: phonetic,
            meaning: meaning.substring(0, 100) + (meaning.length > 100 ? "..." : "")
          })
        });

        if (saveRes.ok) {
          fetchHistory(); // Refresh history
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (phonetics: any[]) => {
    const audioObj = phonetics.find((p: any) => p.audio && p.audio.length > 0);
    if (audioObj) {
      const audio = new Audio(audioObj.audio);
      audio.play();
    } else {
      showToast(language === 'vi' ? "Không có phát âm cho từ này" : "No audio available", "error");
    }
  };

  const getPronunciationText = (entry: any) => {
    if (entry.phonetic) return entry.phonetic;
    if (entry.phonetics && entry.phonetics.length > 0) {
      const p = entry.phonetics.find((p: any) => p.text);
      if (p) return p.text;
    }
    return "";
  };

  return (
    <div className="container" style={{ padding: "4rem 1rem", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            {language === 'vi' ? "Từ Điển" : "Dictionary"}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {language === 'vi' ? "Tra cứu từ vựng tiếng Anh chi tiết" : "Detailed English vocabulary lookup"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>
        {/* Main Dictionary Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Search Box */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={language === 'vi' ? "Nhập từ cần tra (VD: hello)..." : "Enter a word (e.g. hello)..."}
                  className="input-field"
                  style={{ paddingLeft: "3rem", fontSize: "1.1rem" }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
                {loading ? (language === 'vi' ? 'Đang tra...' : 'Searching...') : (language === 'vi' ? 'Tra từ' : 'Search')}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {error && (
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <Book size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <h3>{error}</h3>
            </div>
          )}

          {result && (
            <div className="glass-panel animate-fade-in" style={{ padding: "2.5rem", position: "relative", overflow: "hidden" }}>
              {/* Header: Word & Phonetics */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "2.5rem", margin: 0, color: "var(--primary)" }}>{result.word}</h2>
                  {result.phonetics && result.phonetics.some((p: any) => p.audio) && (
                    <button 
                      onClick={() => playAudio(result.phonetics)}
                      style={{ 
                        background: "rgba(99, 102, 241, 0.1)", 
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        color: "var(--primary)",
                        width: "40px", height: "40px", 
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      title="Play audio"
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"}
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontFamily: "monospace" }}>
                  {getPronunciationText(result)}
                </div>
              </div>

              {/* Meanings */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {result.meanings.map((meaning: any, mIndex: number) => (
                  <div key={mIndex}>
                    <div style={{ 
                      display: "inline-block", 
                      padding: "0.3rem 0.8rem", 
                      background: "rgba(255,255,255,0.05)", 
                      borderRadius: "6px",
                      fontStyle: "italic",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      border: "1px solid var(--border-color)"
                    }}>
                      {meaning.partOfSpeech}
                    </div>
                    
                    <ol style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {meaning.definitions.map((def: any, dIndex: number) => (
                        <li key={dIndex} style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: "1.6" }}>
                          <div style={{ marginBottom: "0.5rem" }}>{def.definition}</div>
                          {def.example && (
                            <div style={{ 
                              color: "var(--text-secondary)", 
                              fontStyle: "italic",
                              paddingLeft: "1rem",
                              borderLeft: "2px solid var(--primary)",
                              fontSize: "1rem"
                            }}>
                              "{def.example}"
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>

                    {/* Synonyms & Antonyms */}
                    {meaning.synonyms && meaning.synonyms.length > 0 && (
                      <div style={{ marginTop: "1.5rem", fontSize: "0.95rem" }}>
                        <span style={{ color: "var(--text-secondary)", marginRight: "0.5rem" }}>Synonyms:</span>
                        <span style={{ color: "var(--primary)" }}>{meaning.synonyms.join(", ")}</span>
                      </div>
                    )}
                    {meaning.antonyms && meaning.antonyms.length > 0 && (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                        <span style={{ color: "var(--text-secondary)", marginRight: "0.5rem" }}>Antonyms:</span>
                        <span style={{ color: "var(--danger)" }}>{meaning.antonyms.join(", ")}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)", fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>
                Powered by Free Dictionary API
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
              <Book size={64} style={{ margin: "0 auto 1.5rem", opacity: 0.2 }} />
              <h2>{language === 'vi' ? "Khám phá thế giới từ vựng" : "Discover vocabulary"}</h2>
              <p style={{ maxWidth: "400px", margin: "1rem auto" }}>
                {language === 'vi' 
                  ? "Nhập bất kỳ từ tiếng Anh nào để xem định nghĩa, phiên âm và ví dụ câu theo chuẩn từ điển quốc tế."
                  : "Enter any English word to see definitions, phonetics, and sentence examples according to international dictionary standards."}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-panel" style={{ padding: "1.5rem", position: "sticky", top: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.1rem" }}>
                <Clock size={18} color="var(--primary)" /> 
                {language === 'vi' ? "Lịch sử" : "History"}
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem" }}
                  title={language === 'vi' ? "Xóa lịch sử" : "Clear history"}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {!user ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                <p>{language === 'vi' ? "Đăng nhập để lưu lịch sử tra từ." : "Log in to save lookup history."}</p>
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                <p>{language === 'vi' ? "Chưa có từ nào được tra cứu." : "No words looked up yet."}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "60vh", overflowY: "auto", paddingRight: "0.5rem" }}>
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => { setQuery(item.word); handleSearch(undefined, item.word); }}
                    style={{ 
                      padding: "0.75rem", 
                      background: "rgba(255,255,255,0.03)", 
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid transparent",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "transparent"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong style={{ color: "var(--primary)", fontSize: "1rem" }}>{item.word}</strong>
                      <ArrowRight size={14} color="var(--text-secondary)" />
                    </div>
                    {item.phonetic && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "monospace", marginBottom: "0.25rem" }}>{item.phonetic}</div>}
                    <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.meaning || (language === 'vi' ? "Không có định nghĩa" : "No definition")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        /* Add some scrollbar styling for history */
        div::-webkit-scrollbar {
          width: 4px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }
        
        /* Layout adjustments for mobile */
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
