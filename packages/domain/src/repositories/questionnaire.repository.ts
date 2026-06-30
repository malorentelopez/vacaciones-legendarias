import { prisma } from "@repo/database/prisma";
import type { Prisma } from "@repo/database";
import type { QuestionOption } from "../utils/questionnaire";

export interface CreateQuestionInput {
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  order: number;
}

export class QuestionnaireRepository {
  async findByMission(missionId: string) {
    return prisma.missionQuestionnaire.findMany({
      where: { missionId },
      include: {
        questions: { orderBy: { order: "asc" } },
        submissions: {
          include: { character: { select: { id: true, name: true } } },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.missionQuestionnaire.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        mission: true,
        submissions: true,
      },
    });
  }

  async findLatestByMission(missionId: string) {
    return prisma.missionQuestionnaire.findFirst({
      where: { missionId },
      orderBy: { order: "desc" },
      include: {
        questions: { orderBy: { order: "asc" } },
        submissions: true,
      },
    });
  }

  async getNextOrder(missionId: string) {
    const latest = await prisma.missionQuestionnaire.findFirst({
      where: { missionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return (latest?.order ?? -1) + 1;
  }

  async create(
    missionId: string,
    data: { title: string; description?: string; order: number },
    questions: CreateQuestionInput[]
  ) {
    return prisma.missionQuestionnaire.create({
      data: {
        missionId,
        title: data.title,
        description: data.description,
        order: data.order,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: q.options as unknown as Prisma.InputJsonValue,
            correctOptionId: q.correctOptionId,
            order: q.order,
          })),
        },
      },
      include: {
        questions: { orderBy: { order: "asc" } },
        submissions: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.missionQuestionnaire.delete({ where: { id } });
  }

  async hasPassedSubmission(questionnaireId: string, characterId: string) {
    const submission = await prisma.questionnaireSubmission.findUnique({
      where: {
        questionnaireId_characterId: { questionnaireId, characterId },
      },
    });
    return submission?.passed ?? false;
  }

  async getSubmission(questionnaireId: string, characterId: string) {
    return prisma.questionnaireSubmission.findUnique({
      where: {
        questionnaireId_characterId: { questionnaireId, characterId },
      },
    });
  }

  async upsertSubmission(data: {
    questionnaireId: string;
    characterId: string;
    answers: Record<string, string>;
    correctCount: number;
    totalCount: number;
    passed: boolean;
  }) {
    return prisma.questionnaireSubmission.upsert({
      where: {
        questionnaireId_characterId: {
          questionnaireId: data.questionnaireId,
          characterId: data.characterId,
        },
      },
      update: {
        answers: data.answers,
        correctCount: data.correctCount,
        totalCount: data.totalCount,
        passed: data.passed,
        submittedAt: new Date(),
      },
      create: {
        questionnaireId: data.questionnaireId,
        characterId: data.characterId,
        answers: data.answers,
        correctCount: data.correctCount,
        totalCount: data.totalCount,
        passed: data.passed,
      },
    });
  }

  async countPassedSubmissions(questionnaireId: string, characterIds: string[]) {
    if (characterIds.length === 0) return 0;
    return prisma.questionnaireSubmission.count({
      where: {
        questionnaireId,
        characterId: { in: characterIds },
        passed: true,
      },
    });
  }

  async findActiveForCharacter(missionId: string, characterId: string) {
    const questionnaires = await prisma.missionQuestionnaire.findMany({
      where: { missionId },
      orderBy: { order: "desc" },
      include: {
        questions: { orderBy: { order: "asc" } },
        submissions: {
          where: { characterId, passed: true },
        },
      },
    });

    for (const questionnaire of questionnaires) {
      if (questionnaire.submissions.length === 0) {
        return questionnaire;
      }
    }

    return null;
  }

  async findActiveSummariesForMissions(missionIds: string[], characterId: string) {
    if (missionIds.length === 0) {
      return new Map<string, { id: string; title: string; questionCount: number }>();
    }

    const questionnaires = await prisma.missionQuestionnaire.findMany({
      where: { missionId: { in: missionIds } },
      include: {
        questions: { select: { id: true } },
        submissions: {
          where: { characterId, passed: true },
          select: { id: true },
          take: 1,
        },
      },
    });

    const byMission = new Map<string, typeof questionnaires>();
    for (const questionnaire of questionnaires) {
      const list = byMission.get(questionnaire.missionId) ?? [];
      list.push(questionnaire);
      byMission.set(questionnaire.missionId, list);
    }

    const result = new Map<string, { id: string; title: string; questionCount: number }>();
    for (const [missionId, list] of byMission) {
      const sorted = [...list].sort((a, b) => b.order - a.order);
      const active = sorted.find((questionnaire) => questionnaire.submissions.length === 0);
      if (active) {
        result.set(missionId, {
          id: active.id,
          title: active.title,
          questionCount: active.questions.length,
        });
      }
    }

    return result;
  }
}
