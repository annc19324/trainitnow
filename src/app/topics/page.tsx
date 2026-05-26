import { prisma } from "@/lib/prisma";
import TopicsClient from "./TopicsClient";

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tests: true, documents: true } } }
  });

  return <TopicsClient topics={topics} />;
}
