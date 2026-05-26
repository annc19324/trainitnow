import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, FileText } from "lucide-react";
import styles from "../topics.module.css";

export default async function TopicDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: {
      tests: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!topic) notFound();

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{topic.title}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>{topic.description}</p>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
        <section>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <FileText size={24} color="var(--accent-primary)" /> Documents & Theory
          </h2>
          {topic.documents.length === 0 ? (
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No documents available for this topic.
            </div>
          ) : (
            <div className={styles.grid}>
              {topic.documents.map(doc => (
                <div key={doc.id} className={`glass-panel ${styles.card}`}>
                  <h3 style={{ marginBottom: "0.5rem" }}>{doc.title}</h3>
                  <p className={styles.description}>{doc.description}</p>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    View Document
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <CheckCircle size={24} color="var(--accent-secondary)" /> Practice Tests
          </h2>
          {topic.tests.length === 0 ? (
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No tests available for this topic.
            </div>
          ) : (
            <div className={styles.grid}>
              {topic.tests.map(test => (
                <Link href={`/tests/${test.id}`} key={test.id} className={`glass-panel ${styles.card}`}>
                  <h3 style={{ marginBottom: "0.5rem" }}>{test.title}</h3>
                  <p className={styles.description}>{test.description}</p>
                  <span className="btn btn-primary" style={{ marginTop: "auto", alignSelf: "flex-start" }}>
                    Take Test
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
