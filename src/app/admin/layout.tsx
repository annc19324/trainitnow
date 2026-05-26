import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";
import { Settings, FileText, CheckCircle, BookOpen, Users, History } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={`glass-panel ${styles.sidebar}`}>
        <h2 className="gradient-text" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <Settings size={20} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} /> Admin
        </h2>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}><Settings size={16} /> Dashboard</Link>
          <Link href="/admin/users" className={styles.navLink}><Users size={16} /> Users</Link>
          <Link href="/admin/topics" className={styles.navLink}><BookOpen size={16} /> Topics</Link>
          <Link href="/admin/tests" className={styles.navLink}><CheckCircle size={16} /> Tests</Link>
          <Link href="/admin/documents" className={styles.navLink}><FileText size={16} /> Documents</Link>
          <Link href="/admin/flashcards" className={styles.navLink}><BookOpen size={16} /> Flashcards</Link>
          <Link href="/admin/history" className={styles.navLink}><History size={16} /> Lịch sử làm bài</Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

