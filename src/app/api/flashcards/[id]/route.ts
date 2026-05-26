import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: { id },
      include: {
        flashcards: true,
      },
    });

    if (!flashcardSet) {
      return NextResponse.json({ error: 'Flashcard Set not found' }, { status: 404 });
    }

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    // delete existing flashcards and recreate them (simplest way to handle update)
    if (data.flashcards) {
      await prisma.flashcard.deleteMany({
        where: { flashcardSetId: id }
      });
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      topicId: data.topicId || null,
    };

    if (data.flashcards && data.flashcards.length > 0) {
      updateData.flashcards = {
        create: data.flashcards.map((fc: any) => ({
          term: fc.term,
          definition: fc.definition
        }))
      };
    }

    const updatedFlashcardSet = await prisma.flashcardSet.update({
      where: { id },
      data: updateData,
      include: {
        flashcards: true
      }
    });

    return NextResponse.json(updatedFlashcardSet);
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.flashcardSet.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
