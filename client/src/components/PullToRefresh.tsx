import React, { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface PullToRefreshProps {
  children: React.ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const { language } = useLanguage();
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = () => {
    if (window.scrollY > 0) return false;
    if (document.documentElement.scrollTop > 0) return false;
    if (document.body.scrollTop > 0) return false;

    let el: HTMLElement | null = containerRef.current;
    while (el) {
      if (el.scrollTop > 0) return false;
      el = el.parentElement;
    }
    return true;
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only pull to refresh if we are at the top of the page/container
      if (isAtTop() && !isRefreshing) {
        setStartY(e.touches[0].pageY);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // If the page/container is scrolled down, cancel pulling immediately
      if (!isAtTop()) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      if (!isPulling || isRefreshing) return;

      const currentY = e.touches[0].pageY;
      const diff = currentY - startY;

      if (diff > 0) {
        // Prevent default scrolling down when pulling down at the top
        if (e.cancelable) {
          e.preventDefault();
        }
        // Apply resistance
        const distance = Math.min(diff * 0.4, 80);
        setPullDistance(distance);
      } else {
        // If user drags up (scrolling down), cancel pull state immediately
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      setIsPulling(false);

      if (pullDistance >= 60) {
        setIsRefreshing(true);
        setPullDistance(60);
        
        // Trigger page refresh after short delay
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startY, isPulling, pullDistance, isRefreshing]);

  return (
    <div ref={containerRef} style={{ position: "relative", minHeight: "100%" }}>
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{
            position: "absolute",
            top: `${pullDistance - 50}px`,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "40px",
            zIndex: 10001,
            pointerEvents: "none",
            transition: isPulling ? "none" : "top 0.3s ease, opacity 0.3s ease",
            opacity: pullDistance > 10 ? Math.min(pullDistance / 50, 1) : 0,
          }}
        >
          <div
            style={{
              background: "var(--accent-gradient)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "var(--shadow-md)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "spin-animation" : ""}
              style={{
                transform: !isRefreshing ? `rotate(${pullDistance * 4}deg)` : undefined,
                animation: isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "0.2rem 0.6rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {isRefreshing
              ? (language === "vi" ? "Đang tải lại..." : "Refreshing...")
              : pullDistance >= 60
              ? (language === "vi" ? "Thả ra để tải lại" : "Release to refresh")
              : (language === "vi" ? "Kéo xuống để tải lại" : "Pull down to refresh")}
          </span>
        </div>
      )}

      {/* Inject style tag for spinning animation if not exists */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {children}
    </div>
  );
}
