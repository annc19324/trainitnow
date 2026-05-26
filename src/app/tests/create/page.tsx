"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseQuickTest } from "@/lib/parseTest";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function CreateTestPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"standard" | "quick">("standard");
  const [rawText, setRawText] = useState("");

  const [questions, setQuestions] = useState<any[]>([
    { content: "", type: "MULTIPLE_CHOICE", answers: [{ content: "", isCorrect: true }] }
  ]);

  useEffect(() => {
    fetch("/api/topics").then(res => res.json()).then(data => {
      setTopics(data);
      if (data.length > 0) setTopicId(data[0].id);
    });
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { content: "", type: "MULTIPLE_CHOICE", answers: [{ content: "", isCorrect: true }] }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const addAnswer = (qIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].answers.push({ content: "", isCorrect: false });
    setQuestions(newQs);
  };

  const updateAnswer = (qIndex: number, aIndex: number, field: string, value: any) => {
    const newQs = [...questions];
    if (field === "isCorrect" && value === true) {
      // If it's single choice, we might want to unset others, but let's allow multiple correct for now
    }
    newQs[qIndex].answers[aIndex][field] = value;
    setQuestions(newQs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let finalQuestions = questions;
      
      if (mode === "quick") {
        finalQuestions = parseQuickTest(rawText);
        if (finalQuestions.length === 0) {
          throw new Error("No valid questions parsed from text.");
        }
      }

      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          topicId,
          type: "MULTIPLE_CHOICE",
          questions: finalQuestions
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create test");
      }

      const test = await res.json();
      router.push(`/tests/${test.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>
        Create Test
      </h1>

      <div className="glass-panel" style={{ padding: "2rem" }}>
        {error && <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}
        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button type="button" className={`btn ${mode === "standard" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("standard")}>Standard Builder</button>
          <button type="button" className={`btn ${mode === "quick" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("quick")}>Quick Parse Text</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Test Title</label>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
            <input className="input-field" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Topic</label>
            <select className="input-field" value={topicId} onChange={e => setTopicId(e.target.value)} required style={{ appearance: "none", backgroundColor: "var(--bg-secondary)" }}>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          {mode === "quick" ? (
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Quick Format Content 
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                  (Example: [Câu 1] \n *A \n B \n C \n D)
                </span>
              </label>
              <textarea 
                className="input-field" 
                style={{ minHeight: "250px", resize: "vertical", fontFamily: "monospace", lineHeight: "1.5" }}
                value={rawText} 
                onChange={e => setRawText(e.target.value)} 
                required={mode === "quick"}
                placeholder="[Câu 1]&#10;*Đáp án đúng&#10;Đáp án sai&#10;Đáp án sai&#10;&#10;[Câu 2]&#10;..."
              />
            </div>
          ) : (
            <div>
              <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Questions Builder</h3>
              {questions.map((q, qIndex) => (
                <div key={qIndex} style={{ border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <strong>Question {qIndex + 1}</strong>
                    <select 
                      className="input-field" 
                      style={{ width: "auto", padding: "0.2rem 0.5rem", fontSize: "0.85rem" }}
                      value={q.type} 
                      onChange={e => updateQuestion(qIndex, "type", e.target.value)}
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="ESSAY">Essay / Writing</option>
                    </select>
                  </div>
                  <input 
                    className="input-field" 
                    placeholder="Enter question content..." 
                    value={q.content} 
                    onChange={e => updateQuestion(qIndex, "content", e.target.value)} 
                    required={mode === "standard"}
                    style={{ marginBottom: "1rem" }}
                  />
                  
                  {q.type === "MULTIPLE_CHOICE" && (
                    <div>
                      {q.answers.map((a: any, aIndex: number) => (
                        <div key={aIndex} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <input 
                            type="checkbox" 
                            checked={a.isCorrect} 
                            onChange={e => updateAnswer(qIndex, aIndex, "isCorrect", e.target.checked)} 
                          />
                          <input 
                            className="input-field" 
                            style={{ flex: 1, padding: "0.4rem 0.8rem" }}
                            placeholder={`Answer ${aIndex + 1}`}
                            value={a.content}
                            onChange={e => updateAnswer(qIndex, aIndex, "content", e.target.value)}
                            required={mode === "standard"}
                          />
                        </div>
                      ))}
                      <button type="button" className="btn btn-secondary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem", marginTop: "0.5rem" }} onClick={() => addAnswer(qIndex)}>
                        + Add Answer
                      </button>
                    </div>
                  )}

                  {q.type === "ESSAY" && (
                    <div style={{ marginTop: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        Expected Answer / Sample Answer
                      </label>
                      <input 
                        className="input-field" 
                        style={{ padding: "0.5rem 0.8rem" }}
                        placeholder="Enter the correct answer for grading..." 
                        value={q.answers[0]?.content || ""}
                        onChange={e => updateAnswer(qIndex, 0, "content", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                <Plus size={16} style={{ marginRight: "0.5rem" }} /> Add Question
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-end" }}>
            {loading ? "Creating..." : "Save Test"}
          </button>
        </form>
      </div>
    </div>
  );
}
