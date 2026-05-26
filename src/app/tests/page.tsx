import { prisma } from "@/lib/prisma";
import TestsClient from "./TestsClient";

export default async function TestsPage() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: { topic: true, _count: { select: { questions: true } } }
  });

  return <TestsClient tests={tests} />;
}
