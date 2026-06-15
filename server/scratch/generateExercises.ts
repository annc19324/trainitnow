import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const sets = await prisma.flashcardSet.findMany({
    where: {
      title: {
        contains: 'Tiếng Anh 9 Global Success Unit'
      }
    },
    include: {
      flashcards: true
    }
  });

  for (const set of sets) {
    if (set.flashcards.length < 4) continue;

    console.log(`Processing: ${set.title}...`);

    // 1. Create Theory Document
    const existingDoc = await prisma.document.findFirst({
      where: {
        title: `Lý thuyết từ vựng: ${set.title}`,
        userId: set.userId
      }
    });

    if (!existingDoc) {
      let docContent = `# ${set.title} - Lý thuyết từ vựng\n\n`;
      set.flashcards.forEach((f, idx) => {
        docContent += `**${idx + 1}. ${f.term}**\n- Nghĩa: ${f.definition}\n\n`;
      });

      // We'll store it as a markdown file or just save the content in description if possible.
      // Wait, Document has fileUrl. Maybe we should save the markdown content into a file and upload it, or just use description?
      // Since it requires fileUrl, let's just make a dummy or generic URL for now, or just use a data URI.
      const base64Doc = Buffer.from(docContent).toString('base64');
      const dataUri = `data:text/markdown;base64,${base64Doc}`;
      
      await prisma.document.create({
        data: {
          title: `Lý thuyết từ vựng: ${set.title}`,
          description: `Tài liệu lý thuyết tổng hợp từ vựng của ${set.title}`,
          fileUrl: dataUri,
          type: 'THEORY',
          userId: set.userId,
          topicId: set.topicId
        }
      });
      console.log(`  -> Created Theory Document`);
    }

    // 2. Create Exercise (Test)
    const existingTest = await prisma.test.findFirst({
      where: {
        title: `Bài tập từ vựng: ${set.title}`,
        userId: set.userId
      }
    });

    if (!existingTest) {
      const test = await prisma.test.create({
        data: {
          title: `Bài tập từ vựng: ${set.title}`,
          description: `Bài tập trắc nghiệm ôn tập từ vựng cho ${set.title}`,
          type: 'MULTIPLE_CHOICE',
          userId: set.userId,
          topicId: set.topicId,
        }
      });

      // Generate up to 10 questions or as many as flashcards
      const numQuestions = Math.min(set.flashcards.length, 15);
      const selectedFlashcards = [...set.flashcards].sort(() => 0.5 - Math.random()).slice(0, numQuestions);

      let order = 1;
      for (const fc of selectedFlashcards) {
        // Find 3 incorrect answers
        const wrongAnswers = set.flashcards
          .filter(f => f.id !== fc.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(f => f.term);
        
        // Sometimes we don't have enough wrong answers if set is small
        while (wrongAnswers.length < 3) {
            wrongAnswers.push("N/A");
        }

        const options = [
          { content: fc.term, isCorrect: true },
          { content: wrongAnswers[0], isCorrect: false },
          { content: wrongAnswers[1], isCorrect: false },
          { content: wrongAnswers[2], isCorrect: false },
        ].sort(() => 0.5 - Math.random());

        await prisma.question.create({
          data: {
            content: `Chọn từ vựng tiếng Anh tương ứng với nghĩa sau:\n"${fc.definition}"`,
            type: 'MULTIPLE_CHOICE',
            order: order++,
            testId: test.id,
            answers: {
              create: options
            }
          }
        });
      }
      console.log(`  -> Created Test with ${numQuestions} questions`);
    } else {
        console.log(`  -> Test already exists.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
