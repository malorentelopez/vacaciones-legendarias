export interface QuestionOption {
  id: string;
  text: string;
}

export interface GradeableQuestion {
  id: string;
  correctOptionId: string;
}

export interface GradeResult {
  correctCount: number;
  totalCount: number;
  passed: boolean;
}

export function gradeAnswers(
  questions: GradeableQuestion[],
  answers: Record<string, string>
): GradeResult {
  if (questions.length === 0) {
    return { correctCount: 0, totalCount: 0, passed: false };
  }

  let correctCount = 0;

  for (const question of questions) {
    const selected = answers[question.id];
    if (!selected) continue;
    if (selected === question.correctOptionId) {
      correctCount++;
    }
  }

  const totalCount = questions.length;
  const passed = correctCount === totalCount && totalCount > 0;

  return { correctCount, totalCount, passed };
}

export function stripCorrectAnswers<
  T extends { correctOptionId: string; options: unknown },
>(questions: T[]) {
  return questions.map(({ correctOptionId: _correct, ...rest }) => rest);
}
