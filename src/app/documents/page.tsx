import { prisma } from "@/lib/prisma";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { topic: true }
  });

  return <DocumentsClient documents={documents} />;
}
