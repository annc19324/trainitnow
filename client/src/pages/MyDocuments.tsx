import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export default function MyDocumentsPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", padding: "4rem 0" }}>
      <FileText size={64} color="var(--accent-primary)" style={{ margin: "0 auto 2rem auto" }} />
      <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Saved Documents</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginBottom: "2rem" }}>
        You haven't saved any documents yet. Explore the theory section to save useful materials.
      </p>
      <Link to="/documents" className="btn btn-primary">Browse Documents</Link>
    </div>
  );
}
