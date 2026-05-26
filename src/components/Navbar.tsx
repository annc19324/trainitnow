"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css";
import { User, Settings, LogOut, Menu, X, BookOpen, CheckCircle, FileText, ChevronDown, Globe, ClipboardList } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { t, toggleLanguage, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logoGroup} onClick={closeMobileMenu}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img style={{ width: "20%", height: "20%" }} src="/logo.png" alt="Logo" className={styles.logo} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: "700" }}>TrainItNow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`${styles.navLinks} ${styles.desktopOnly}`}>
          <Link href="/about" className={styles.link}>{t("nav.about")}</Link>
          <Link href="/topics" className={styles.link}>{t("nav.topics")}</Link>
          <Link href="/tests" className={styles.link}>{t("nav.tests")}</Link>
          <Link href="/documents" className={styles.link}>{t("nav.documents")}</Link>
          <Link href="/flashcards" className={styles.link}>{t("nav.flashcards")}</Link>
        </nav>

        {/* Desktop Auth Group */}
        <div className={`${styles.authGroup} ${styles.desktopOnly}`}>
          <button className={styles.iconButton} title={language === 'en' ? 'Change to Vietnamese' : 'Đổi sang Tiếng Anh'} onClick={toggleLanguage}>
            <Globe size={20} />
            <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem", fontWeight: "bold" }}>{language.toUpperCase()}</span>
          </button>

          {status === "loading" ? (
            <div style={{ width: "150px", height: "40px", background: "var(--bg-secondary)", borderRadius: "var(--radius-full)", opacity: 0.5 }} />
          ) : session ? (
            <div className={styles.userDropdownContainer} ref={dropdownRef}>
              <button
                className={styles.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className={styles.avatarPlaceholder}>
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={styles.userName}>{session.user?.name}</span>
                <ChevronDown size={16} className={dropdownOpen ? styles.iconRotated : ''} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <strong>{session.user?.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>@{((session.user as any)?.username) || session.user?.name}</span>
                  </div>

                  <Link href={`/${((session.user as any)?.username) || session.user?.name}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> {t("nav.profile")}
                  </Link>
                  <Link href="/my-tests" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <ClipboardList size={16} /> {t("nav.myTests")}
                  </Link>
                  <Link href="/my-documents" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FileText size={16} /> {t("nav.savedDocs")}
                  </Link>

                  {(session.user as any)?.role === "ADMIN" && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Settings size={16} /> {t("nav.admin")}
                    </Link>
                  )}

                  <div className={styles.dropdownDivider} />

                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  >
                    <LogOut size={16} /> {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">{t("nav.login")}</Link>
              <Link href="/register" className="btn btn-primary">{t("nav.register")}</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          ref={mobileToggleRef}
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className={styles.mobileMenu}>
          <nav className={styles.mobileNavLinks}>
            <Link href="/about" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.about")}</Link>
            <Link href="/topics" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.topics")}</Link>
            <Link href="/tests" className={styles.mobileLink} onClick={closeMobileMenu}><CheckCircle size={18} /> {t("nav.tests")}</Link>
            <Link href="/documents" className={styles.mobileLink} onClick={closeMobileMenu}><FileText size={18} /> {t("nav.documents")}</Link>
            <Link href="/flashcards" className={styles.mobileLink} onClick={closeMobileMenu}><BookOpen size={18} /> {t("nav.flashcards")}</Link>
          </nav>

          <div className={styles.mobileAuthGroup}>
            {status === "loading" ? (
              <div style={{ width: "100%", height: "40px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", opacity: 0.5 }} />
            ) : session ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.avatarPlaceholder}>
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{session.user?.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>@{((session.user as any)?.username) || session.user?.name}</div>
                  </div>
                </div>
                <Link href={`/${((session.user as any)?.username) || session.user?.name}`} className={styles.mobileLink} onClick={closeMobileMenu}><User size={18} /> {t("nav.profile")}</Link>
                <Link href="/my-tests" className={styles.mobileLink} onClick={closeMobileMenu}><ClipboardList size={18} /> {t("nav.myTests")}</Link>
                {(session.user as any)?.role === "ADMIN" && (
                  <Link href="/admin" className={styles.mobileLink} onClick={closeMobileMenu}><Settings size={18} /> {t("nav.admin")}</Link>
                )}
                <button onClick={() => signOut()} className={`${styles.mobileLink} ${styles.mobileLinkDanger}`}>
                  <LogOut size={18} /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button className={styles.mobileLink} onClick={toggleLanguage}>
                  <Globe size={18} /> {language === "en" ? "Tiếng Việt" : "English"}
                </button>
                <Link href="/login" className="btn btn-secondary" style={{ width: "100%" }} onClick={closeMobileMenu}>{t("nav.login")}</Link>
                <Link href="/register" className="btn btn-primary" style={{ width: "100%" }} onClick={closeMobileMenu}>{t("nav.register")}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
