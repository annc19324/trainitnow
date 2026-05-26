import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, topicId, type, questions } = await req.json();

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ message: "Title and questions are required" }, { status: 400 });
    }

    const test = await prisma.test.create({
      data: {
        title,
        description,
        topicId: topicId || null,
        type,
        userId: (session.user as any).id,
        questions: {
          create: questions.map((q: any, i: number) => ({
            content: q.content,
            type: "MULTIPLE_CHOICE",
            order: i,
            answers: {
              create: q.answers.map((a: any) => ({
                content: a.content,
                isCorrect: a.isCorrect
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: { answers: true }
        }
      }
    });

    return NextResponse.json(test);
  } catch (error: any) {
    console.error("Test Creation Error:", error);
    return NextResponse.json({ message: error.message || "Error creating test" }, { status: 500 });
  }
}
