import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminDashboard() {
  const [topicCount, testCount, documentCount, userCount, historyCount] = await Promise.all([
    prisma.topic.count(),
    prisma.test.count(),
    prisma.document.count(),
    prisma.user.count(),
    prisma.testResult.count(),
  ]);

  return <AdminClient counts={{ topicCount, testCount, documentCount, userCount, historyCount }} />;
}

