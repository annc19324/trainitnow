"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import styles from "../topics/topics.module.css";
import { useLanguage } from "@/components/LanguageContext";

export default function TestsClient({ tests }: { tests: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{t("tests.title")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
            {t("tests.desc")}
          </p>
        </div>
        <Link href="/tests/create" className="btn btn-primary">
          {t("tests.create")}
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <CheckCircle size={48} style={{ color: "var(--text-secondary)", margin: "0 auto 1rem auto" }} />
          <h3>{t("tests.empty.title")}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{t("tests.empty.desc")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {tests.map((test) => (
            <Link href={`/tests/${test.id}`} key={test.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>{test.title}</h3>
                <span className={styles.badge}>{test.type}</span>
              </div>
              <p className={styles.description}>{test.description || t("topics.noDesc")}</p>
              <div className={styles.stats}>
                <span>{t("tests.topic")} {test.topic?.title || t("tests.general")}</span>
                <span>{test._count.questions} {t("tests.questions")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
