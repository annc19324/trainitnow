import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ClipboardList } from "lucide-react";
import { useAuth, apiRequest } from "../components/AuthContext";

export default function MyTestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    apiRequest("/api/test-results")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResults(data);
        }
      })
      .catch((err) => console.error("Error loading test results:", err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <ClipboardList size={36} color="var(--accent-primary)" />
        <div>
          <h1 className="gradient-text" style={{ fontSize: "2rem", margin: 0 }}>Lịch sử làm bài</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            {results.length} bài đã làm
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <CheckCircle size={64} color="var(--accent-primary)" style={{ margin: "0 auto 1.5rem", display: "block" }} />
          <h2 style={{ marginBottom: "1rem" }}>Chưa có kết quả nào</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Hãy bắt đầu làm bài kiểm tra để xem kết quả tại đây!
          </p>
          <Link to="/tests" className="btn btn-primary">Xem bài kiểm tra</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((r: any) => {
            const pct = Math.round((r.score / r.totalQ) * 100);
            const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
            return (
              <div key={r.id} className="glass-panel" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                {/* Score circle */}
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: color, color: "white", display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontWeight: "bold"
                }}>
                  <span style={{ fontSize: "1rem" }}>{pct}%</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/tests/${r.testId}`}
                    style={{ fontWeight: 600, fontSize: "1rem", display: "block", marginBottom: "0.25rem" }}
                    className="gradient-text"
                  >
                    {r.test?.title || "Bài kiểm tra"}
                  </Link>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {r.score}/{r.totalQ} câu đúng
                  </span>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                    })}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.7 }}>
                    {new Date(r.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
