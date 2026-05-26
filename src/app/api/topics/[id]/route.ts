import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const params = await props.params;

    await prisma.topic.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Topic deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting topic" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const params = await props.params;
    const body = await req.json();
    const { title, description } = body;

    const updatedTopic = await prisma.topic.update({
      where: { id: params.id },
      data: { title, description }
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    return NextResponse.json({ message: "Error updating topic" }, { status: 500 });
  }
}
