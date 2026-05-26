"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import styles from "./topics.module.css";
import { useLanguage } from "@/components/LanguageContext";

export default function TopicsClient({ topics }: { topics: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{t("topics.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
          {t("topics.desc")}
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <BookOpen size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3>{t("topics.empty.title")}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{t("topics.empty.desc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {topics.map((topic) => (
            <Link href={`/topics/${topic.id}`} key={topic.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>{topic.title}</h3>
                <span className={styles.badge}>{topic._count.tests + topic._count.documents} {t("topics.resources")}</span>
              </div>
              <p className={styles.description}>{topic.description || t("topics.noDesc")}</p>
              <div className={styles.stats}>
                <span>{topic._count.documents} {t("admin.documents")}</span>
                <span>{topic._count.tests} {t("admin.tests")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
