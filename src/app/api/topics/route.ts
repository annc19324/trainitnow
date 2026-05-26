import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching topics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { title, description } = await req.json();
    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ message: "Error creating topic" }, { status: 500 });
  }
}
