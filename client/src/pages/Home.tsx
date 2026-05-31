import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import { ArrowRight, BookOpen, FileText, CheckCircle, Volume2, Search } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useAuth } from "../components/AuthContext";
import HomeComments from "../components/HomeComments";

const ipaData = [
  // Vowels (Monophthongs)
  { symbol: "i:", type: "vowel", subType: "long", example: "sheep", displayExample: "sh<b>ee</b>p", viType: "Nguyên âm đơn dài" },
  { symbol: "ɪ", type: "vowel", subType: "short", example: "ship", displayExample: "sh<b>i</b>p", viType: "Nguyên âm đơn ngắn" },
  { symbol: "ʊ", type: "vowel", subType: "short", example: "good", displayExample: "g<b>oo</b>d", viType: "Nguyên âm đơn ngắn" },
  { symbol: "u:", type: "vowel", subType: "long", example: "shoot", displayExample: "sh<b>oo</b>t", viType: "Nguyên âm đơn dài" },
  { symbol: "e", type: "vowel", subType: "short", example: "left", displayExample: "l<b>e</b>ft", viType: "Nguyên âm đơn ngắn" },
  { symbol: "ə", type: "vowel", subType: "short", example: "teacher", displayExample: "teach<b>e</b>r", viType: "Nguyên âm đơn ngắn" },
  { symbol: "ɜ:", type: "vowel", subType: "long", example: "girl", displayExample: "g<b>i</b>rl", viType: "Nguyên âm đơn dài" },
  { symbol: "ɔ:", type: "vowel", subType: "long", example: "door", displayExample: "d<b>oo</b>r", viType: "Nguyên âm đơn dài" },
  { symbol: "æ", type: "vowel", subType: "short", example: "cat", displayExample: "c<b>a</b>t", viType: "Nguyên âm đơn ngắn" },
  { symbol: "ʌ", type: "vowel", subType: "short", example: "up", displayExample: "<b>u</b>p", viType: "Nguyên âm đơn ngắn" },
  { symbol: "a:", type: "vowel", subType: "long", example: "far", displayExample: "f<b>a</b>r", viType: "Nguyên âm đơn dài" },
  { symbol: "ɒ", type: "vowel", subType: "short", example: "on", displayExample: "<b>o</b>n", viType: "Nguyên âm đơn ngắn" },

  // Diphthongs
  { symbol: "ɪə", type: "diphthong", subType: "diphthong", example: "here", displayExample: "h<b>ere</b>", viType: "Nguyên âm đôi" },
  { symbol: "eɪ", type: "diphthong", subType: "diphthong", example: "day", displayExample: "d<b>ay</b>", viType: "Nguyên âm đôi" },
  { symbol: "ʊə", type: "diphthong", subType: "diphthong", example: "tour", displayExample: "t<b>our</b>", viType: "Nguyên âm đôi" },
  { symbol: "ɔɪ", type: "diphthong", subType: "diphthong", example: "boy", displayExample: "b<b>oy</b>", viType: "Nguyên âm đôi" },
  { symbol: "əʊ", type: "diphthong", subType: "diphthong", example: "show", displayExample: "sh<b>ow</b>", viType: "Nguyên âm đôi" },
  { symbol: "eə", type: "diphthong", subType: "diphthong", example: "hair", displayExample: "h<b>air</b>", viType: "Nguyên âm đôi" },
  { symbol: "aɪ", type: "diphthong", subType: "diphthong", example: "my", displayExample: "m<b>y</b>", viType: "Nguyên âm đôi" },
  { symbol: "aʊ", type: "diphthong", subType: "diphthong", example: "cow", displayExample: "c<b>ow</b>", viType: "Nguyên âm đôi" },

  // Consonants
  { symbol: "p", type: "consonant", subType: "voiceless", example: "pen", displayExample: "<b>p</b>en", viType: "Phụ âm vô thanh" },
  { symbol: "b", type: "consonant", subType: "voiced", example: "bad", displayExample: "<b>b</b>ad", viType: "Phụ âm hữu thanh" },
  { symbol: "t", type: "consonant", subType: "voiceless", example: "tea", displayExample: "<b>t</b>ea", viType: "Phụ âm vô thanh" },
  { symbol: "d", type: "consonant", subType: "voiced", example: "did", displayExample: "<b>d</b>id", viType: "Phụ âm hữu thanh" },
  { symbol: "tʃ", type: "consonant", subType: "voiceless", example: "chin", displayExample: "<b>ch</b>in", viType: "Phụ âm vô thanh" },
  { symbol: "dʒ", type: "consonant", subType: "voiced", example: "june", displayExample: "<b>j</b>une", viType: "Phụ âm hữu thanh" },
  { symbol: "k", type: "consonant", subType: "voiceless", example: "cat", displayExample: "<b>c</b>at", viType: "Phụ âm vô thanh" },
  { symbol: "g", type: "consonant", subType: "voiced", example: "go", displayExample: "<b>g</b>o", viType: "Phụ âm hữu thanh" },
  { symbol: "f", type: "consonant", subType: "voiceless", example: "fall", displayExample: "<b>f</b>all", viType: "Phụ âm vô thanh" },
  { symbol: "v", type: "consonant", subType: "voiced", example: "voice", displayExample: "<b>v</b>oice", viType: "Phụ âm hữu thanh" },
  { symbol: "θ", type: "consonant", subType: "voiceless", example: "thin", displayExample: "<b>th</b>in", viType: "Phụ âm vô thanh" },
  { symbol: "ð", type: "consonant", subType: "voiced", example: "then", displayExample: "<b>th</b>en", viType: "Phụ âm hữu thanh" },
  { symbol: "s", type: "consonant", subType: "voiceless", example: "so", displayExample: "<b>s</b>o", viType: "Phụ âm vô thanh" },
  { symbol: "z", type: "consonant", subType: "voiced", example: "zoo", displayExample: "<b>z</b>oo", viType: "Phụ âm hữu thanh" },
  { symbol: "ʃ", type: "consonant", subType: "voiceless", example: "she", displayExample: "<b>sh</b>e", viType: "Phụ âm vô thanh" },
  { symbol: "ʒ", type: "consonant", subType: "voiced", example: "vision", displayExample: "vi<b>si</b>on", viType: "Phụ âm hữu thanh" },
  { symbol: "m", type: "consonant", subType: "voiced", example: "man", displayExample: "<b>m</b>an", viType: "Phụ âm hữu thanh" },
  { symbol: "n", type: "consonant", subType: "voiced", example: "no", displayExample: "<b>n</b>o", viType: "Phụ âm hữu thanh" },
  { symbol: "ŋ", type: "consonant", subType: "voiced", example: "sing", displayExample: "si<b>ng</b>", viType: "Phụ âm hữu thanh" },
  { symbol: "h", type: "consonant", subType: "voiceless", example: "hat", displayExample: "<b>h</b>at", viType: "Phụ âm vô thanh" },
  { symbol: "l", type: "consonant", subType: "voiced", example: "leg", displayExample: "<b>l</b>eg", viType: "Phụ âm hữu thanh" },
  { symbol: "r", type: "consonant", subType: "voiced", example: "red", displayExample: "<b>r</b>ed", viType: "Phụ âm hữu thanh" },
  { symbol: "w", type: "consonant", subType: "voiced", example: "wet", displayExample: "<b>w</b>et", viType: "Phụ âm hữu thanh" },
  { symbol: "j", type: "consonant", subType: "voiced", example: "yes", displayExample: "<b>y</b>es", viType: "Phụ âm hữu thanh" }
];

export default function Home() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [activeFilter, setActiveFilter] = useState<"all" | "vowel" | "diphthong" | "consonant">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const playSound = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Pronounce the word clearly
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.75; // slightly slower for clear phonetic articulation
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredIpa = ipaData.filter(item => {
    // 1. Apply category filter
    if (activeFilter !== "all" && item.type !== activeFilter) {
      return false;
    }
    
    // 2. Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.symbol.toLowerCase().includes(q) || item.example.toLowerCase().includes(q);
    }
    
    return true;
  });

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} animate-fade-in`}>
            {t("home.title1")} <span className="gradient-text">TrainItNow</span>
          </h1>
          <p className={styles.subtitle}>
            {t("home.desc")}
          </p>
          <div className={styles.ctaGroup}>
            <Link to={user ? "/topics" : "/register"} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
              {t("home.start")} <ArrowRight size={18} style={{ marginLeft: "8px", flexShrink: 0 }} />
            </Link>
            <Link to="/topics" className="btn btn-secondary" style={{ whiteSpace: "nowrap" }}>
              {t("home.browse")}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.featureIconWrapper}><BookOpen size={24} className={styles.featureIcon} /></div>
          <h3>{t("home.theory.title")}</h3>
          <p>{t("home.theory.desc")}</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.featureIconWrapper}><CheckCircle size={24} className={styles.featureIcon} /></div>
          <h3>{t("home.tests.title")}</h3>
          <p>{t("home.tests.desc")}</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.featureIconWrapper}><FileText size={24} className={styles.featureIcon} /></div>
          <h3>{t("home.track.title")}</h3>
          <p>{t("home.track.desc")}</p>
        </div>
      </section>

      {/* Interactive IPA Chart */}
      <section className={styles.ipaSection}>
        <div className={styles.ipaHeader}>
          <h2 className={styles.ipaTitle}>
            {language === "vi" ? "Bảng Phiên Âm Quốc Tế (IPA)" : "Interactive IPA Phonetic Chart"}
          </h2>
          <p className={styles.ipaSubtitle}>
            {language === "vi" 
              ? "Bảng đầy đủ 44 âm tiêu chuẩn trong tiếng Anh. Hãy nhấp chuột vào từng âm để nghe cách phát âm minh họa!" 
              : "Master standard English pronunciation with the complete 44 phonemes. Click any sound card to listen!"}
          </p>
          <div className={styles.ipaControls}>
            <div className={styles.ipaSearchWrapper}>
              <Search size={18} className={styles.ipaSearchIcon} />
              <input
                type="text"
                placeholder={language === "vi" ? "Tìm âm hoặc từ ví dụ..." : "Search sound or word..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.ipaSearchInput}
              />
            </div>
            <div className={styles.ipaFilters}>
              <button 
                onClick={() => setActiveFilter("all")} 
                className={`${styles.filterBtn} ${activeFilter === "all" ? styles.filterBtnActive : ""}`}
              >
                {language === "vi" ? "Tất cả (44 âm)" : "All"}
              </button>
              <button 
                onClick={() => setActiveFilter("vowel")} 
                className={`${styles.filterBtn} ${activeFilter === "vowel" ? styles.filterBtnActive : ""}`}
              >
                {language === "vi" ? "Nguyên âm đơn (12)" : "Monophthongs"}
              </button>
              <button 
                onClick={() => setActiveFilter("diphthong")} 
                className={`${styles.filterBtn} ${activeFilter === "diphthong" ? styles.filterBtnActive : ""}`}
              >
                {language === "vi" ? "Nguyên âm đôi (8)" : "Diphthongs"}
              </button>
              <button 
                onClick={() => setActiveFilter("consonant")} 
                className={`${styles.filterBtn} ${activeFilter === "consonant" ? styles.filterBtnActive : ""}`}
              >
                {language === "vi" ? "Phụ âm (24)" : "Consonants"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.ipaGrid}>
          {filteredIpa.map((item) => (
            <div 
              key={item.symbol} 
              className={styles.ipaCard}
              onClick={() => playSound(item.example)}
              title={`Click to hear "${item.example}"`}
            >
              <span className={`${styles.ipaCardBadge} ${
                item.type === "vowel" 
                  ? styles.badgeVowel 
                  : item.type === "diphthong" 
                  ? styles.badgeDiphthong 
                  : styles.badgeConsonant
              }`}>
                {language === "vi" 
                  ? (item.type === "vowel" ? "Đơn" : item.type === "diphthong" ? "Đôi" : item.subType === "voiced" ? "Hữu thanh" : "Vô thanh") 
                  : item.subType}
              </span>
              <div className={styles.ipaSymbol}>/{item.symbol}/</div>
              <div 
                className={styles.ipaExample}
                dangerouslySetInnerHTML={{ __html: item.displayExample }}
              />
              <div className={styles.ipaPlayBtn}>
                <Volume2 size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomeComments />
    </div>
  );
}
