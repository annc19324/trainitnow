"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminHistoryClient({ results }: { results: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");

  const filtered = results.filter((r) => {
    const pct = Math.round((r.score / r.totalQ) * 100);
    const matchSearch =
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.test?.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "pass" && pct >= 50) ||
      (filter === "fail" && pct < 50);
    return matchSearch && matchFilter;
  });

  const totalPassed = results.filter((r) => Math.round((r.score / r.totalQ) * 100) >= 50).length;

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Lịch sử làm bài ({results.length} kết quả)</h1>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Tổng lượt làm", value: results.length, color: "var(--accent-primary)" },
          { label: "Đạt (≥50%)", value: totalPassed, color: "var(--success)" },
          { label: "Chưa đạt", value: results.length - totalPassed, color: "var(--danger)" },
        ].map((s) => (
          <div key={s.label} className="glass-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          className="input-field"
          style={{ flex: 1, minWidth: "200px" }}
          placeholder="Tìm theo tên, email hoặc tên bài kiểm tra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["all", "pass", "fail"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? "btn btn-primary" : "btn btn-secondary"}
              style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
            >
              {f === "all" ? "Tất cả" : f === "pass" ? "Đạt" : "Chưa đạt"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Không có kết quả nào phù hợp.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                {["Người dùng", "Bài kiểm tra", "Kết quả", "Tỉ lệ", "Thời gian"].map((h) => (
                  <th key={h} style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const pct = Math.round((r.score / r.totalQ) * 100);
                const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ fontWeight: 600 }}>{r.user?.name || "–"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        @{r.user?.username || r.user?.email}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Link href={`/tests/${r.testId}`} className="gradient-text" style={{ fontWeight: 500 }}>
                        {r.test?.title || r.testId}
                      </Link>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {r.score}/{r.totalQ} câu
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        background: color, color: "white",
                        padding: "0.2rem 0.6rem", borderRadius: "1rem",
                        fontSize: "0.85rem", fontWeight: 700
                      }}>
                        {pct}%
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
