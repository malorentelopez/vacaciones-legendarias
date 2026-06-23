import { QuestionnaireRepository, type CreateQuestionInput } from "../repositories/questionnaire.repository";
import { CharacterRepository } from "../repositories/character.repository";
import { MissionRepository } from "../repositories/mission.repository";
import { MissionService } from "./mission.service";
import { GameEventRepository } from "../repositories/game-event.repository";
import { gradeAnswers, stripCorrectAnswers, type QuestionOption } from "../utils/questionnaire";
import { getPeriodKey } from "../utils/period";
import type { QuestionnaireState } from "../types/questionnaire";

export type { QuestionnaireState };

export interface CreateQuestionnaireInput {
  title: string;
  description?: string;
  questions: {
    text: string;
    options: QuestionOption[];
    correctOptionId: string;
  }[];
}

export class QuestionnaireService {
  constructor(
    private questionnaireRepo = new QuestionnaireRepository(),
    private characterRepo = new CharacterRepository(),
    private missionRepo = new MissionRepository(),
    private missionService = new MissionService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getMissionQuestionnaires(missionId: string, familyId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) throw new Error("Misión no encontrada");
    if (mission.type !== "QUESTIONNAIRE") throw new Error("Esta misión no es de tipo cuestionario");
    if (mission.familyId && mission.familyId !== familyId) {
      throw new Error("No tienes acceso a esta misión");
    }

    const questionnaires = await this.questionnaireRepo.findByMission(missionId);
    const characters = await this.characterRepo.findByFamily(familyId);
    const latest = questionnaires[questionnaires.length - 1] ?? null;
    const canCreateNext = await this.canCreateNextQuestionnaire(missionId, familyId);

    return {
      mission,
      questionnaires,
      characters: characters.map((c) => ({ id: c.id, name: c.name })),
      canCreateNext,
      latestQuestionnaireId: latest?.id ?? null,
    };
  }

  async canCreateNextQuestionnaire(missionId: string, familyId: string) {
    const latest = await this.questionnaireRepo.findLatestByMission(missionId);
    if (!latest) return true;

    const characters = await this.characterRepo.findByFamily(familyId);
    if (characters.length === 0) return true;

    const passedCount = await this.questionnaireRepo.countPassedSubmissions(
      latest.id,
      characters.map((c) => c.id)
    );

    return passedCount >= characters.length;
  }

  async createQuestionnaire(missionId: string, familyId: string, input: CreateQuestionnaireInput) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) throw new Error("Misión no encontrada");
    if (mission.type !== "QUESTIONNAIRE") throw new Error("Esta misión no es de tipo cuestionario");
    if (mission.familyId && mission.familyId !== familyId) {
      throw new Error("No tienes acceso a esta misión");
    }

    if (input.questions.length === 0) {
      throw new Error("El cuestionario debe tener al menos una pregunta");
    }

    for (const question of input.questions) {
      if (question.options.length < 2) {
        throw new Error("Cada pregunta debe tener al menos 2 opciones");
      }
      if (!question.options.some((o) => o.id === question.correctOptionId)) {
        throw new Error("La respuesta correcta debe ser una de las opciones");
      }
    }

    const canCreate = await this.canCreateNextQuestionnaire(missionId, familyId);
    if (!canCreate) {
      throw new Error("Todos los personajes deben aprobar el cuestionario actual antes de crear uno nuevo");
    }

    const order = await this.questionnaireRepo.getNextOrder(missionId);
    const questions: CreateQuestionInput[] = input.questions.map((q, index) => ({
      text: q.text,
      options: q.options,
      correctOptionId: q.correctOptionId,
      order: index,
    }));

    return this.questionnaireRepo.create(
      missionId,
      { title: input.title, description: input.description, order },
      questions
    );
  }

  async deleteQuestionnaire(questionnaireId: string, familyId: string) {
    const questionnaire = await this.questionnaireRepo.findById(questionnaireId);
    if (!questionnaire) throw new Error("Cuestionario no encontrado");

    const mission = questionnaire.mission;
    if (mission.familyId && mission.familyId !== familyId) {
      throw new Error("No tienes acceso a este cuestionario");
    }

    const hasPassed = questionnaire.submissions.some((s) => s.passed);
    if (hasPassed) {
      throw new Error("No se puede eliminar un cuestionario que ya ha sido aprobado");
    }

    return this.questionnaireRepo.delete(questionnaireId);
  }

  async getActiveQuestionnaireForCharacter(missionId: string, characterId: string) {
    return this.questionnaireRepo.findActiveForCharacter(missionId, characterId);
  }

  async getQuestionnaireState(
    missionId: string,
    characterId: string,
    periodCompleted: boolean
  ): Promise<{
    questionnaireState: QuestionnaireState;
    activeQuestionnaire?: { id: string; title: string; questionCount: number };
  }> {
    if (periodCompleted) {
      return { questionnaireState: "completed_period" };
    }

    const active = await this.questionnaireRepo.findActiveForCharacter(missionId, characterId);
    if (!active) {
      return { questionnaireState: "waiting" };
    }

    return {
      questionnaireState: "available",
      activeQuestionnaire: {
        id: active.id,
        title: active.title,
        questionCount: active.questions.length,
      },
    };
  }

  async getQuestionnaireForPlayer(questionnaireId: string, characterId: string, familyId: string) {
    const questionnaire = await this.questionnaireRepo.findById(questionnaireId);
    if (!questionnaire) throw new Error("Cuestionario no encontrado");

    const mission = questionnaire.mission;
    if (mission.type !== "QUESTIONNAIRE") throw new Error("Misión inválida");
    if (mission.familyId && mission.familyId !== familyId) {
      throw new Error("No tienes acceso a este cuestionario");
    }

    const character = await this.characterRepo.findById(characterId);
    if (!character || character.familyId !== familyId) {
      throw new Error("Personaje no encontrado");
    }

    const active = await this.questionnaireRepo.findActiveForCharacter(mission.id, characterId);
    if (!active || active.id !== questionnaireId) {
      throw new Error("Este cuestionario no está disponible");
    }

    const existing = await this.questionnaireRepo.getSubmission(questionnaireId, characterId);
    if (existing?.passed) {
      throw new Error("Ya has aprobado este cuestionario");
    }

    return {
      id: questionnaire.id,
      title: questionnaire.title,
      description: questionnaire.description,
      missionId: mission.id,
      missionTitle: mission.title,
      questions: stripCorrectAnswers(questionnaire.questions),
    };
  }

  async submitQuestionnaire(
    questionnaireId: string,
    characterId: string,
    familyId: string,
    answers: Record<string, string>
  ) {
    const questionnaire = await this.questionnaireRepo.findById(questionnaireId);
    if (!questionnaire) throw new Error("Cuestionario no encontrado");

    const mission = questionnaire.mission;
    if (mission.type !== "QUESTIONNAIRE") throw new Error("Misión inválida");
    if (mission.familyId && mission.familyId !== familyId) {
      throw new Error("No tienes acceso a este cuestionario");
    }

    const character = await this.characterRepo.findById(characterId);
    if (!character || character.familyId !== familyId) {
      throw new Error("Personaje no encontrado");
    }

    const active = await this.questionnaireRepo.findActiveForCharacter(mission.id, characterId);
    if (!active || active.id !== questionnaireId) {
      throw new Error("Este cuestionario no está disponible");
    }

    const existing = await this.questionnaireRepo.getSubmission(questionnaireId, characterId);
    if (existing?.passed) {
      throw new Error("Ya has aprobado este cuestionario");
    }

    for (const question of questionnaire.questions) {
      if (!answers[question.id]) {
        throw new Error("Debes responder todas las preguntas");
      }
      const options = question.options as unknown as QuestionOption[];
      if (!options.some((o) => o.id === answers[question.id])) {
        throw new Error("Respuesta inválida");
      }
    }

    const grade = gradeAnswers(questionnaire.questions, answers);

    const submission = await this.questionnaireRepo.upsertSubmission({
      questionnaireId,
      characterId,
      answers,
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      passed: grade.passed,
    });

    let missionCompleted = false;

    if (grade.passed) {
      await this.gameEventRepo.create(characterId, "QUESTIONNAIRE_COMPLETED", {
        questionnaireId,
        questionnaireTitle: questionnaire.title,
        missionId: mission.id,
        missionTitle: mission.title,
        correctCount: grade.correctCount,
        totalCount: grade.totalCount,
      });

      const periodKey = getPeriodKey(mission.frequency);
      const alreadyCompleted = await this.missionRepo.isCompleted(mission.id, characterId, periodKey);
      if (!alreadyCompleted) {
        await this.missionService.completeMissionProgress(mission.id, characterId);
        missionCompleted = true;
      }
    }

    return {
      submission,
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      passed: grade.passed,
      missionCompleted,
      xpReward: grade.passed && missionCompleted ? mission.xpReward : 0,
      crystalReward: grade.passed && missionCompleted ? mission.crystalReward : 0,
    };
  }
}
