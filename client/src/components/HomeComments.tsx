import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useAuth, apiRequest } from "./AuthContext";
import { useLanguage } from "./LanguageContext";

export default function HomeComments() {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const TAKE = 5;

  const fetchComments = async (reset = false) => {
    try {
      setLoading(true);
      const currentSkip = reset ? 0 : skip;
      const res = await apiRequest(`/api/comments?skip=${currentSkip}&take=${TAKE}`);
      const data = await res.json();
      
      if (res.ok && data.comments) {
        if (reset) {
          setComments(data.comments);
          setSkip(TAKE);
        } else {
          setComments([...comments, ...data.comments]);
          setSkip(skip + TAKE);
        }
        setTotal(data.total || 0);
      } else {
        console.error("Failed to load comments:", data.error);
        if (reset) setComments([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      alert(t("home.comments.loginReq") || "Vui lòng đăng nhập để bình luận!");
      return;
    }
    
    try {
      const res = await apiRequest("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      
      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setTotal(total + 1);
        setContent("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const { t } = useLanguage();
  return (
    <div className="glass-panel" style={{ padding: "2rem", marginTop: "4rem" }}>
      <h2 className="gradient-text" style={{ fontSize: "1.35rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MessageSquare size={20} /> {t("home.comments.title") || "Community Reviews & Comments"}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
          {user ? (user.name?.charAt(0).toUpperCase() || 'U') : '?'}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <textarea 
            className="input-field" 
            placeholder={t("home.comments.placeholder") || "Leave a review or comment..."}
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ minHeight: "80px", resize: "vertical" }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            <Send size={16} style={{ marginRight: "0.25rem" }} /> {t("home.comments.post") || "Post Comment"}
          </button>
        </div>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {(comments || []).map((comment: any) => (
          <div key={comment.id} style={{ display: "flex", gap: "1rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{comment.user?.name || "Anonymous"}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>@{comment.user?.username || comment.user?.name?.toLowerCase().replace(/\s+/g, '')}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "auto" }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {comments.length < total && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => fetchComments(false)}
            disabled={loading}
          >
            {loading ? (t("home.comments.loading") || "Loading...") : (t("home.comments.loadMore") || "Load older comments")}
          </button>
        </div>
      )}
    </div>
  );
}
