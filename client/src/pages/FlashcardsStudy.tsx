import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../components/LanguageContext";
import { ArrowLeft, Edit, RotateCcw, Volume2 } from "lucide-react";
import { apiRequest, useAuth } from "../components/AuthContext";

const getFontSizeForLines = (text: string, isTerm: boolean = true) => {
  if (!text) return "2rem";
  const lines = text.split("\n");
  let maxLength = 0;
  for (const line of lines) {
    if (line.trim().length > maxLength) {
      maxLength = line.trim().length;
    }
  }

  // Highly optimized thresholds for single-line no-wrap layout on mobile
  if (maxLength > 45) return "0.75rem";
  if (maxLength > 35) return "0.85rem";
  if (maxLength > 25) return "1.05rem";
  if (maxLength > 18) return "1.3rem";
  if (maxLength > 12) return "1.65rem";
  return isTerm ? "2.2rem" : "2rem";
};

export default function StudyFlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [set, setSet] = useState<any>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [learningQueue, setLearningQueue] = useState<any[]>([]);
  const [skippedInRound, setSkippedInRound] = useState<any[]>([]);
  const [isFinishedRound, setIsFinishedRound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchSet();
  }, [id]);

  const fetchSet = async () => {
    try {
      const res = await apiRequest(`/api/flashcards/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSet(data);
        
        // Sort cards alphabetically by term/title
        const sortedCards = [...(data.flashcards || [])].sort((a, b) => 
          a.term.localeCompare(b.term, language === "vi" ? "vi" : "en", { sensitivity: "base" })
        );
        setLearningQueue(sortedCards);
        
        setSkippedInRound([]);
        setIsFinishedRound(false);
        setCurrentIndex(0);
      } else {
        navigate("/flashcards");
      }
    } catch (error) {
      console.error("Failed to fetch flashcard set", error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping the card
    if ('speechSynthesis' in window) {
      // Cancel previous speech to avoid queuing / iOS freeze issues
      window.speechSynthesis.cancel();

      const wordToSpeak = text.split('\n')[0].replace(/\(.*\)/, '').trim();
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.lang = 'en-US';

      // Crucial for iOS/iPhone Safari: explicitly bind an English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.toLowerCase().startsWith('en-')) || 
                           voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert(language === 'vi' ? 'Trình duyệt của bạn không hỗ trợ đọc văn bản.' : 'Your browser does not support text-to-speech.');
    }
  };

  const handleGotIt = () => {
    if (currentIndex < learningQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    } else {
      setIsFlipped(false);
      setTimeout(() => setIsFinishedRound(true), 150);
    }
  };

  const handleForgot = () => {
    setSkippedInRound(prev => [...prev, learningQueue[currentIndex]]);
    
    if (currentIndex < learningQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    } else {
      setIsFlipped(false);
      setTimeout(() => setIsFinishedRound(true), 150);
    }
  };

  const handleShuffle = () => {
    const remainingCards = [...learningQueue.slice(currentIndex)];
    for (let i = remainingCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingCards[i], remainingCards[j]] = [remainingCards[j], remainingCards[i]];
    }
    const newQueue = [...learningQueue.slice(0, currentIndex), ...remainingCards];
    setLearningQueue(newQueue);
    setIsFlipped(false);
  };

  const handleReviewSkipped = () => {
    setLearningQueue(skippedInRound);
    setSkippedInRound([]);
    setCurrentIndex(0);
    setIsFinishedRound(false);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    const sortedCards = [...(set?.flashcards || [])].sort((a, b) => 
      a.term.localeCompare(b.term, language === "vi" ? "vi" : "en", { sensitivity: "base" })
    );
    setLearningQueue(sortedCards);
    setSkippedInRound([]);
    setCurrentIndex(0);
    setIsFinishedRound(false);
    setIsFlipped(false);
  };

  if (loading) return <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>Loading...</div>;

  if (!set || !set.flashcards || set.flashcards.length === 0) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <h2>{set?.title}</h2>
        <p style={{ margin: "1rem 0 2rem" }}>{language === 'vi' ? 'Bộ thẻ này chưa có thẻ nào.' : 'This set has no cards yet.'}</p>
        {user && (
          <Link to={`/flashcards/${id}/edit`} className="btn btn-primary">
            <Edit size={18} /> {language === 'vi' ? 'Thêm thẻ ngay' : 'Add Cards Now'}
          </Link>
        )}
      </div>
    );
  }

  const currentCard = !isFinishedRound ? learningQueue[currentIndex] : null;

  return (
    <div className="container" style={{ padding: "1rem", minHeight: "80vh", maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/flashcards" className="btn btn-secondary" style={{ padding: "0.5rem" }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", wordBreak: "break-word", whiteSpace: "normal" }}>
            {set.title}
          </h1>
        </div>
        {user && (
          <Link to={`/flashcards/${id}/edit`} className="btn btn-secondary" style={{ padding: "0.5rem" }}>
            <Edit size={18} />
          </Link>
        )}
      </div>
      
      {/* Progress Bar */}
      {!isFinishedRound && learningQueue.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 600 }}>
            <span>{language === 'vi' ? 'Tiến độ' : 'Progress'}</span>
            <span>{currentIndex + 1} / {learningQueue.length}</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ 
              width: `${((currentIndex + 1) / learningQueue.length) * 100}%`, 
              height: "100%", 
              background: "var(--accent-primary)", 
              transition: "width 0.3s ease" 
            }} />
          </div>
        </div>
      )}

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center",
        perspective: "1000px",
        marginBottom: "1.5rem"
      }}>
        {!isFinishedRound && currentCard ? (
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              position: "relative",
              width: "100%",
              height: "280px",
              textAlign: "center",
              transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)",
              cursor: "pointer"
            }}
          >
            {/* Front of card */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "var(--bg-secondary)",
              borderRadius: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem 2rem",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ 
                fontSize: getFontSizeForLines(currentCard.term, true),
                textAlign: "center", 
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold"
              }}>
                {currentCard.term.split("\n").map((line: string, idx: number) => (
                  <div key={idx} style={{ whiteSpace: "nowrap", width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {line}
                  </div>
                ))}
              </div>
              <button 
                onClick={(e) => speakText(currentCard.term, e)}
                style={{
                  marginTop: "1rem",
                  background: "#2563eb",
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 6px 12px rgba(37, 99, 235, 0.3)",
                  flexShrink: 0
                }}
                title={language === 'vi' ? 'Nghe phát âm' : 'Listen'}
              >
                <Volume2 size={24} />
              </button>
              <div style={{ position: "absolute", bottom: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {language === 'vi' ? 'Nhấn ra ngoài để lật thẻ (Tiếng Việt)' : 'Click outside to flip (Vietnamese)'}
              </div>
            </div>

            {/* Back of card */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "var(--accent-primary)",
              color: "white",
              borderRadius: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem 2rem",
              transform: "rotateX(180deg)"
            }}>
              <div style={{ 
                fontSize: getFontSizeForLines(currentCard.definition, false),
                textAlign: "center", 
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold"
              }}>
                {currentCard.definition.split("\n").map((line: string, idx: number) => (
                  <div key={idx} style={{ whiteSpace: "nowrap", width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {line}
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", bottom: "0.5rem", fontSize: "0.75rem", opacity: 0.8 }}>
                {language === 'vi' ? 'Nhấn để lật thẻ (Tiếng Anh)' : 'Click to flip (English)'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", background: "var(--bg-secondary)", padding: "3rem 1.5rem", borderRadius: "1rem" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.8rem" }}>{language === 'vi' ? 'Vòng học kết thúc!' : 'Round completed!'}</h2>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", margin: "2rem 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--success, #10b981)" }}>
                  {learningQueue.length - skippedInRound.length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  {language === 'vi' ? 'Đã nhớ' : 'Got it'}
                </div>
              </div>
              <div style={{ width: "1px", background: "var(--border-color)" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--danger)" }}>
                  {skippedInRound.length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  {language === 'vi' ? 'Chưa nhớ' : 'Forgot'}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
              {skippedInRound.length > 0 && (
                <button className="btn btn-primary" onClick={handleReviewSkipped} style={{ width: "100%", maxWidth: "300px", padding: "1rem" }}>
                  <RotateCcw size={18} /> {language === 'vi' ? `Ôn lại ${skippedInRound.length} thẻ chưa nhớ` : `Review ${skippedInRound.length} forgot cards`}
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleRestart} style={{ width: "100%", maxWidth: "300px", padding: "1rem" }}>
                <RotateCcw size={18} /> {language === 'vi' ? 'Học lại toàn bộ' : 'Restart from beginning'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!isFinishedRound && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: "0.5rem", 
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          flexWrap: "nowrap"
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleForgot}
            style={{ 
              flex: 1,
              padding: "0.75rem 0.5rem", 
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--danger)", 
              border: "1px solid var(--danger)", 
              background: "transparent",
              whiteSpace: "nowrap",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {language === 'vi' ? 'Chưa nhớ' : 'Forgot'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleShuffle}
            title={language === 'vi' ? 'Đảo thẻ' : 'Shuffle'}
            style={{ 
              width: "44px", 
              height: "44px", 
              borderRadius: "50%", 
              padding: 0, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <RotateCcw size={18} />
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleGotIt}
            style={{ 
              flex: 1,
              padding: "0.75rem 0.5rem", 
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "var(--success, #10b981)", 
              borderColor: "var(--success, #10b981)",
              whiteSpace: "nowrap",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {language === 'vi' ? 'Đã nhớ' : 'Got it'}
          </button>
        </div>
      )}
    </div>
  );
}
