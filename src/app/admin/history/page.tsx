import { prisma } from "@/lib/prisma";
import AdminHistoryClient from "./AdminHistoryClient";

export default async function AdminHistoryPage() {
  const results = await prisma.testResult.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      test: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, username: true, email: true } },
    },
  });

  return <AdminHistoryClient results={results} />;
}
