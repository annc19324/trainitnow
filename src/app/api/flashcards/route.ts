import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const topicId = searchParams.get('topicId');

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (topicId) {
      whereClause.topicId = topicId;
    }

    const flashcardSets = await prisma.flashcardSet.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(flashcardSets);
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // validate
    if (!data.title || !data.userId) {
      return NextResponse.json({ error: 'Title and userId are required' }, { status: 400 });
    }

    const createData: any = {
      title: data.title,
      description: data.description,
      topicId: data.topicId || null,
      userId: data.userId,
    };

    if (data.flashcards && data.flashcards.length > 0) {
      createData.flashcards = { create: data.flashcards };
    }

    const flashcardSet = await prisma.flashcardSet.create({
      data: createData,
      include: {
        flashcards: true
      }
    });

    return NextResponse.json(flashcardSet, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
