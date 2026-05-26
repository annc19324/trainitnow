"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { ArrowRight, BookOpen, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import HomeComments from "@/components/HomeComments";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} animate-fade-in`}>
            {t("home.title1")} <span className="gradient-text">TrainItNow</span>
          </h1>
          <p className={styles.subtitle}>
            {t("home.desc")}
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/register" className="btn btn-primary">
              {t("home.start")} <ArrowRight size={18} style={{ marginLeft: "8px" }} />
            </Link>
            <Link href="/topics" className="btn btn-secondary">
              {t("home.browse")}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.featureIconWrapper}><BookOpen size={24} className={styles.featureIcon} /></div>
          <h3>{t("home.theory.title")}</h3>
          <p>{t("home.theory.desc")}</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.featureIconWrapper}><CheckCircle size={24} className={styles.featureIcon} /></div>
          <h3>{t("home.tests.title")}</h3>
          <p>{t("home.tests.desc")}</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.featureIconWrapper}><FileText size={24} className={styles.featureIcon} /></div>
          <h3>{t("home.track.title")}</h3>
          <p>{t("home.track.desc")}</p>
        </div>
      </section>

      <HomeComments />
    </div>
  );
}
