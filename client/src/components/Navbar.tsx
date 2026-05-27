import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, apiRequest } from "./AuthContext";
import styles from "../styles/Navbar.module.css";
import { User, Settings, LogOut, Menu, X, BookOpen, ClipboardList, FileText, ChevronDown, Globe, Key, MessageSquare } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const formatDisplayName = (fullName: string, maxLength: number = 12) => {
  if (!fullName) return "";
  if (fullName.length <= maxLength) return fullName;

  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName.slice(0, maxLength) + "...";

  let result = "";
  for (let i = parts.length - 1; i >= 0; i--) {
    const candidate = result ? `${parts[i]} ${result}` : parts[i];
    if (candidate.length + 3 > maxLength) {
      if (!result) {
        return "..." + parts[parts.length - 1];
      }
      break;
    }
    result = candidate;
  }
  return "..." + result;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await apiRequest("/api/chat/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logoGroup} onClick={closeMobileMenu} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/logo.png" alt="TrainItNow Logo" style={{ height: "36px", width: "auto" }} />
          <span style={{
            color: "var(--accent-primary)",
            fontWeight: 800,
            fontSize: "1.4rem",
            letterSpacing: "-0.02em"
          }}>
            TrainItNow
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className={`${styles.navLinks} ${styles.desktopOnly}`}>
          <Link to="/about" className={styles.link}>{t("nav.about")}</Link>
          <Link to="/topics" className={styles.link}>{t("nav.topics")}</Link>
          <Link to="/tests" className={styles.link}>{t("nav.tests")}</Link>
          <Link to="/documents" className={styles.link}>{t("nav.documents")}</Link>
          <Link to="/flashcards" className={styles.link}>{t("nav.flashcards")}</Link>
          {user && (
            <Link to="/chat" className={styles.link} style={{ display: "flex", alignItems: "center" }}>
              {language === "vi" ? "Trò chuyện" : "Chat"}
              {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
            </Link>
          )}
        </nav>

        {/* User / Language / Mobile toggle group */}
        <div className={styles.authGroup}>
          <button
            onClick={toggleLanguage}
            className={styles.iconButton}
            title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Globe size={20} />
            <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem", fontWeight: "bold" }}>{language.toUpperCase()}</span>
          </button>

          {user ? (
            <div className={styles.userDropdownContainer} ref={dropdownRef}>
              <button
                className={styles.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className={styles.avatarPlaceholder} style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className={styles.userName}>{formatDisplayName(user.name)}</span>
                <ChevronDown size={16} className={dropdownOpen ? styles.iconRotated : ''} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <strong>{user.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>@{user.username || user.name}</span>
                  </div>

                  <Link to={`/profile/${user.username || user.name}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> {t("nav.profile")}
                  </Link>
                  <Link to="/change-password" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <Key size={16} /> {language === "vi" ? "Đổi mật khẩu" : "Change Password"}
                  </Link>
                  <Link to="/my-tests" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <ClipboardList size={16} /> {t("nav.myTests")}
                  </Link>
                  <Link to="/my-documents" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FileText size={16} /> {t("nav.savedDocs")}
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Settings size={16} /> {t("nav.admin")}
                    </Link>
                  )}

                  <div className={styles.dropdownDivider} />

                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  >
                    <LogOut size={16} /> {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.desktopOnly} style={{ display: "flex", gap: "0.5rem" }}>
              <Link to="/login" className="btn btn-secondary">{t("nav.login")}</Link>
              <Link to="/register" className="btn btn-primary">{t("nav.register")}</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <Link to="/about" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.about")}</Link>
            <Link to="/topics" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.topics")}</Link>
            <Link to="/tests" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.tests")}</Link>
            <Link to="/documents" className={styles.mobileLink} onClick={closeMobileMenu}><FileText size={18} /> {t("nav.documents")}</Link>
            <Link to="/flashcards" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.flashcards")}</Link>
            {user && (
              <Link to="/chat" className={styles.mobileLink} onClick={closeMobileMenu}>
                <MessageSquare size={18} /> {language === "vi" ? "Trò chuyện" : "Chat"}
                {unreadCount > 0 && <span className={styles.mobileUnreadBadge}>{unreadCount}</span>}
              </Link>
            )}
          </div>

          <div className={styles.mobileAuthGroup}>
            {user ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.avatarPlaceholder} style={{ width: "40px", height: "40px", fontSize: "1.2rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>@{user.username || user.name}</div>
                  </div>
                </div>
                <Link to={`/profile/${user.username || user.name}`} className={styles.mobileLink} onClick={closeMobileMenu}><User size={18} /> {t("nav.profile")}</Link>
                <Link to="/change-password" className={styles.mobileLink} onClick={closeMobileMenu}><Key size={18} /> {language === "vi" ? "Đổi mật khẩu" : "Change Password"}</Link>
                <Link to="/my-tests" className={styles.mobileLink} onClick={closeMobileMenu}><ClipboardList size={18} /> {t("nav.myTests")}</Link>
                {user.role === "ADMIN" && (
                  <Link to="/admin" className={styles.mobileLink} onClick={closeMobileMenu}><Settings size={18} /> {t("nav.admin")}</Link>
                )}
                <button
                  onClick={() => { handleLogout(); closeMobileMenu(); }}
                  className={`${styles.mobileLink} ${styles.mobileLinkDanger}`}
                  style={{ width: "100%", textAlign: "left", display: "flex", gap: "1rem" }}
                >
                  <LogOut size={18} /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={closeMobileMenu}>{t("nav.login")}</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>{t("nav.register")}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
