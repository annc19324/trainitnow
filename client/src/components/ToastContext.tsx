import React, { createContext, useContext, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container overlay */}
      <div style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        zIndex: 99999,
        pointerEvents: "none",
      }}>
        {toasts.map((toast) => {
          let bgColor = "var(--accent-primary, #1e3a8a)";
          if (toast.type === "success") bgColor = "var(--success, #10b981)";
          if (toast.type === "error") bgColor = "var(--danger, #ef4444)";

          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: bgColor,
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md, 12px)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                fontWeight: 600,
                fontSize: "0.9rem",
                animation: "fadeIn 0.2s ease",
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
