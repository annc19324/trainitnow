import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function AdminTests() {
  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Manage Tests</h1>
      <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
        <CheckCircle size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
        <h3 style={{ marginBottom: "1rem" }}>No tests found</h3>
        <Link href="/tests/create" className="btn btn-primary">
          Create New Quick Test
        </Link>
      </div>
    </div>
  );
}
