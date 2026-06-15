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
      flashcards: true,
      topic: true
    }
  });

  for (const set of sets) {
    console.log(`\n=== ${set.title} ===`);
    console.log(`Topic ID: ${set.topicId}`);
    console.log(`User ID: ${set.userId}`);
    const vocab = set.flashcards.map(f => `${f.term}: ${f.definition}`);
    console.log(`Flashcards (${vocab.length}):`);
    console.log(vocab.slice(0, 5).join(' | ') + (vocab.length > 5 ? ' ...' : ''));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
