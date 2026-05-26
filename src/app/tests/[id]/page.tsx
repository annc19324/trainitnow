import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TestClient from "./TestClient";

export default async function TestDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      topic: true,
      questions: {
        orderBy: { order: "asc" },
        include: { answers: true }
      }
    }
  });

  if (!test) {
    notFound();
  }

  return <TestClient test={test} />;
}
