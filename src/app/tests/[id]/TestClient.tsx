"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Download, CheckCircle, XCircle } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./test.module.css";

export default function TestClient({ test }: { test: any }) {
  const { data: session } = useSession();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSelect = (questionId: string, answerId: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    let currentScore = 0;
    test.questions.forEach((q: any) => {
      const selected = selectedAnswers[q.id];
      const correctAns = q.answers.find((a: any) => a.isCorrect);
      if (selected === correctAns?.id) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);

    // Save result if logged in
    if (session) {
      setSaving(true);
      try {
        await fetch("/api/test-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testId: test.id,
            score: currentScore,
            totalQ: test.questions.length,
          }),
        });
      } catch (e) {
        console.error("Failed to save test result", e);
      } finally {
        setSaving(false);
      }
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById("test-container");
    if (!element) return;

    const actions = document.getElementById("test-actions");
    if (actions) actions.style.display = "none";

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${test.title}.pdf`);

    if (actions) actions.style.display = "flex";
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div id="test-container" style={{ padding: "2rem", backgroundColor: "var(--bg-primary)" }}>
        <h1 className="gradient-text" style={{ fontSize: "2rem", marginBottom: "0.5rem", textAlign: "center" }}>{test.title}</h1>
        {test.description && <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem" }}>{test.description}</p>}

        {submitted && (
          <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", textAlign: "center", border: "1px solid var(--accent-primary)" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Kết quả của bạn</h2>
            <p className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
              {score} / {test.questions.length}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              {Math.round((score / test.questions.length) * 100)}% — {
                score === test.questions.length ? "Xuất sắc! 🎉" :
                score >= test.questions.length * 0.8 ? "Rất tốt! 👍" :
                score >= test.questions.length * 0.5 ? "Khá tốt, cố lên! 📚" :
                "Cần luyện thêm! 💪"
              }
            </p>
            {session && !saving && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", opacity: 0.7 }}>
                ✓ Kết quả đã được lưu vào lịch sử
              </p>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {test.questions.map((q: any, i: number) => (
            <div key={q.id} className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem", lineHeight: "1.5" }}>
                Câu {i + 1}: {q.content}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {q.answers.map((a: any) => {
                  const isSelected = selectedAnswers[q.id] === a.id;
                  let bgClass = styles.answerOption;
                  let Icon = null;

                  if (submitted) {
                    if (a.isCorrect) {
                      bgClass = `${styles.answerOption} ${styles.correct}`;
                      Icon = <CheckCircle size={18} style={{ color: "var(--success)" }} />;
                    } else if (isSelected && !a.isCorrect) {
                      bgClass = `${styles.answerOption} ${styles.incorrect}`;
                      Icon = <XCircle size={18} style={{ color: "var(--danger)" }} />;
                    }
                  } else if (isSelected) {
                    bgClass = `${styles.answerOption} ${styles.selected}`;
                  }

                  return (
                    <div
                      key={a.id}
                      className={bgClass}
                      onClick={() => handleSelect(q.id, a.id)}
                    >
                      <div className={styles.radioCircle}>
                        {isSelected && <div className={styles.radioInner} />}
                      </div>
                      <span style={{ flex: 1 }}>{a.content}</span>
                      {Icon && Icon}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="test-actions" style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center" }}>
        {!submitted ? (
          <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: "1rem 3rem" }}>
            Nộp bài
          </button>
        ) : (
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Làm lại
          </button>
        )}
        <button onClick={exportPDF} className="btn btn-secondary" style={{ display: "flex", gap: "0.5rem" }}>
          <Download size={18} /> Xuất PDF
        </button>
      </div>
    </div>
  );
}
