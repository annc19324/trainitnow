export function parseQuickTest(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions: any[] = [];
  let currentQuestion: any = null;

  for (const line of lines) {
    if (line.match(/^\[.*\]$/)) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        content: line.replace(/^\[|\]$/g, '').trim(),
        answers: []
      };
    } else {
      if (currentQuestion) {
        const isCorrect = line.startsWith('*');
        const content = isCorrect ? line.substring(1).trim() : line.trim();
        currentQuestion.answers.push({ content, isCorrect });
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}
