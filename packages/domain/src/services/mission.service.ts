import { MissionRepository } from "../repositories/mission.repository";
import { QuestionnaireRepository } from "../repositories/questionnaire.repository";
import { CharacterService } from "./character.service";
import { AchievementService } from "./achievement.service";
import { GameEventRepository } from "../repositories/game-event.repository";
import { getPeriodKey } from "../utils/period";
import type { QuestionnaireState } from "../types/questionnaire";

export class MissionService {
  constructor(
    private missionRepo = new MissionRepository(),
    private questionnaireRepo = new QuestionnaireRepository(),
    private characterService = new CharacterService(),
    private achievementService = new AchievementService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getMissions(familyId?: string) {
    return this.missionRepo.findAll(familyId);
  }

  async getMissionsForCharacter(characterId: string, familyId?: string) {
    const missions = await this.missionRepo.findMainMissions(familyId);
    const result = [];

    for (const mission of missions) {
      const periodKey = getPeriodKey(mission.frequency);
      const completed = await this.missionRepo.isCompleted(mission.id, characterId, periodKey);
      result.push(await this.enrichMissionForCharacter(mission, characterId, periodKey, completed));
    }

    return result;
  }

  async getSideQuestsForCharacter(characterId: string, familyId?: string) {
    const missions = await this.missionRepo.findSideQuests(familyId);
    const result = [];

    for (const mission of missions) {
      const periodKey = getPeriodKey(mission.frequency);
      const completed = await this.missionRepo.isCompleted(mission.id, characterId, periodKey);
      result.push(await this.enrichMissionForCharacter(mission, characterId, periodKey, completed));
    }

    return result;
  }

  async enrichMissionForCharacter(
    mission: Awaited<ReturnType<MissionRepository["findMainMissions"]>>[number],
    characterId: string,
    periodKey: string,
    completed: boolean
  ) {
    const base = { ...mission, periodKey, completed };

    if (mission.type !== "QUESTIONNAIRE") {
      return base;
    }

    let questionnaireState: QuestionnaireState;
    let activeQuestionnaire: { id: string; title: string; questionCount: number } | undefined;

    if (completed) {
      questionnaireState = "completed_period";
    } else {
      const active = await this.questionnaireRepo.findActiveForCharacter(mission.id, characterId);
      if (active) {
        questionnaireState = "available";
        activeQuestionnaire = {
          id: active.id,
          title: active.title,
          questionCount: active.questions.length,
        };
      } else {
        questionnaireState = "waiting";
      }
    }

    return {
      ...base,
      questionnaireState,
      activeQuestionnaire,
    };
  }

  async createMission(data: Parameters<MissionRepository["create"]>[0]) {
    if (data.isSideQuest) {
      data = { ...data, frequency: "DAILY" };
    }
    return this.missionRepo.create(data);
  }

  async updateMission(id: string, data: Parameters<MissionRepository["update"]>[1]) {
    if (data?.isSideQuest) {
      data = { ...data, frequency: "DAILY" };
    }
    return this.missionRepo.update(id, data);
  }

  async deleteMission(id: string) {
    return this.missionRepo.delete(id);
  }

  async completeMission(missionId: string, characterId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) throw new Error("Misión no encontrada");

    if (mission.type === "QUESTIONNAIRE") {
      throw new Error("Esta misión solo se completa aprobando el cuestionario");
    }

    return this.completeMissionProgress(missionId, characterId, mission);
  }

  async completeMissionProgress(
    missionId: string,
    characterId: string,
    mission?: Awaited<ReturnType<MissionRepository["findById"]>>
  ) {
    const resolvedMission = mission ?? (await this.missionRepo.findById(missionId));
    if (!resolvedMission) throw new Error("Misión no encontrada");

    const periodKey = getPeriodKey(resolvedMission.frequency);
    const alreadyCompleted = await this.missionRepo.isCompleted(missionId, characterId, periodKey);
    if (alreadyCompleted) throw new Error("Misión ya completada en este periodo");

    const progress = await this.missionRepo.completeMission(missionId, characterId, periodKey);

    await this.gameEventRepo.create(characterId, "MISSION_COMPLETED", {
      missionId,
      missionTitle: resolvedMission.title,
      xpReward: resolvedMission.xpReward,
      crystalReward: resolvedMission.crystalReward,
    });

    await this.characterService.addXp(
      characterId,
      resolvedMission.xpReward,
      resolvedMission.skillId ?? undefined
    );

    if (resolvedMission.crystalReward > 0) {
      await this.characterService.addCrystals(
        characterId,
        resolvedMission.crystalReward,
        `Misión completada: ${resolvedMission.title}`
      );
    }

    await this.achievementService.evaluateAchievements(characterId);

    return progress;
  }
}
