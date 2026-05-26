import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const all = searchParams.get("all"); // admin only

    const isAdmin = (session.user as any)?.role === "ADMIN";

    const where = all && isAdmin ? {} : { userId: userId || (session.user as any)?.id };

    const results = await prisma.testResult.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        test: { select: { id: true, title: true, type: true } },
        user: { select: { id: true, name: true, username: true, email: true } },
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching test results:", error);
    return NextResponse.json({ message: "Error fetching results" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { testId, score, totalQ } = await req.json();

    if (!testId || score === undefined || !totalQ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.testResult.create({
      data: {
        testId,
        score,
        totalQ,
        userId: (session.user as any).id,
      },
      include: {
        test: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving test result:", error);
    return NextResponse.json({ message: "Error saving result" }, { status: 500 });
  }
}
