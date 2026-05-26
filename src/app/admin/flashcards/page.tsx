"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { Trash2, Edit, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminFlashcardsPage() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      // By not providing a userId, we fetch all flashcard sets (assuming API supports this)
      const res = await fetch("/api/flashcards");
      if (res.ok) {
        const data = await res.json();
        setSets(data);
      }
    } catch (error) {
      console.error("Failed to fetch flashcards", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard set?")) return;
    try {
      const res = await fetch(`/api/flashcards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSets(sets.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete flashcard set");
      }
    } catch (error) {
      alert("Error deleting flashcard set");
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Manage Flashcards</h1>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      ) : sets.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <BookOpen size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3 style={{ marginBottom: "1rem" }}>No flashcard sets found</h3>
          <p style={{ color: "var(--text-secondary)" }}>Users haven't created any flashcard sets yet.</p>
        </div>
      ) : (
        <div className={styles.statsGrid} style={{ gridTemplateColumns: "1fr" }}>
          {sets.map((set) => (
            <div key={set.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{set.title}</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  {set.description || "No description"}
                </p>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <span style={{ 
                    padding: "0.15rem 0.5rem", 
                    borderRadius: "1rem", 
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontWeight: 500
                  }}>
                    {set._count?.flashcards || 0} cards
                  </span>
                  <span>Created: {new Date(set.createdAt).toLocaleDateString()}</span>
                  {set.topicId && <span>Topic ID: {set.topicId}</span>}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/flashcards/${set.id}/edit`} className="btn btn-secondary" title="Edit Set">
                  <Edit size={18} />
                </Link>
                <button onClick={() => handleDelete(set.id)} className="btn btn-secondary" style={{ color: "var(--danger)" }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
