"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { ArrowLeft, Edit, ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";

export default function StudyFlashcardsPage() {
  const { id } = useParams() as { id: string };
  const { language } = useLanguage();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [set, setSet] = useState<any>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [learningQueue, setLearningQueue] = useState<any[]>([]);
  const [skippedInRound, setSkippedInRound] = useState<any[]>([]);
  const [isFinishedRound, setIsFinishedRound] = useState(false);

  useEffect(() => {
    fetchSet();
  }, [id]);

  const fetchSet = async () => {
    try {
      const res = await fetch(`/api/flashcards/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSet(data);
        setLearningQueue(data.flashcards || []);
        setSkippedInRound([]);
        setIsFinishedRound(false);
        setCurrentIndex(0);
      } else {
        router.push("/flashcards");
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
      // Extract only the english word if it has IPA like "artisan (n)\n/ˌɑːtɪˈzæn/"
      const wordToSpeak = text.split('\n')[0].replace(/\(.*\)/, '').trim();
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.lang = 'en-US';
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
    setLearningQueue(set?.flashcards || []);
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
        <Link href={`/flashcards/${id}/edit`} className="btn btn-primary">
          <Edit size={18} /> {language === 'vi' ? 'Thêm thẻ ngay' : 'Add Cards Now'}
        </Link>
      </div>
    );
  }

  const currentCard = !isFinishedRound ? learningQueue[currentIndex] : null;

  return (
    <div className="container" style={{ padding: "1rem", minHeight: "80vh", maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <Link href="/flashcards" className="btn btn-secondary" style={{ padding: "0.5rem" }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {set.title}
          </h1>
        </div>
        <Link href={`/flashcards/${id}/edit`} className="btn btn-secondary" style={{ padding: "0.5rem" }}>
          <Edit size={18} />
        </Link>
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
              background: "var(--primary)", 
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
              height: "280px", // Reduced height to fit better on screen
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
              padding: "2rem",
              border: "1px solid var(--border-color)"
            }}>
              <h2 style={{ fontSize: "2.2rem", wordBreak: "break-word", whiteSpace: "pre-line", textAlign: "center", margin: 0 }}>
                {currentCard.term}
              </h2>
              <button 
                onClick={(e) => speakText(currentCard.term, e)}
                style={{
                  marginTop: "1.5rem",
                  background: "#2563eb", // Hardcoded strong blue for high contrast
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 6px 12px rgba(37, 99, 235, 0.3)" // Stronger shadow
                }}
                title={language === 'vi' ? 'Nghe phát âm' : 'Listen'}
              >
                <Volume2 size={28} />
              </button>
              <div style={{ position: "absolute", bottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {language === 'vi' ? 'Nhấn ra ngoài để lật thẻ (Tiếng Việt)' : 'Click outside to flip (Vietnamese)'}
              </div>
            </div>

            {/* Back of card */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "var(--primary)",
              color: "white",
              borderRadius: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              transform: "rotateX(180deg)"
            }}>
              <h2 style={{ fontSize: "2rem", wordBreak: "break-word", whiteSpace: "pre-line", textAlign: "center", margin: 0 }}>
                {currentCard.definition}
              </h2>
              <div style={{ position: "absolute", bottom: "1rem", fontSize: "0.8rem", opacity: 0.8 }}>
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleForgot}
            style={{ padding: "0.75rem 1.5rem", color: "var(--danger)", border: "1px solid var(--danger)", background: "transparent" }}
          >
            {language === 'vi' ? 'Chưa nhớ (Bỏ qua)' : 'Forgot (Skip)'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleShuffle}
            title={language === 'vi' ? 'Đảo thẻ' : 'Shuffle'}
            style={{ width: "50px", height: "50px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RotateCcw size={20} /> {/* Can use a shuffle icon if available, reusing RotateCcw or similar */}
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleGotIt}
            style={{ padding: "0.75rem 1.5rem", background: "var(--success, #10b981)", borderColor: "var(--success, #10b981)" }}
          >
            {language === 'vi' ? 'Đã nhớ (Tiếp)' : 'Got it (Next)'}
          </button>
        </div>
      )}
    </div>
  );
}
