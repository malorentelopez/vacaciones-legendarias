import { MissionRepository } from "../repositories/mission.repository";
import { QuestionnaireRepository } from "../repositories/questionnaire.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { FreeDayRepository } from "../repositories/free-day.repository";
import { CharacterService } from "./character.service";
import { AchievementService } from "./achievement.service";
import { StreakService } from "./streak.service";
import { GameEventRepository } from "../repositories/game-event.repository";
import { getPeriodKey } from "../utils/period";
import { getDayScheduleType, isTimeInBlock } from "../utils/schedule";
import { missionProgressKey } from "../utils/mission-progress";
import type { QuestionnaireState } from "../types/questionnaire";
import type { DayScheduleType } from "@repo/database";

type MissionWithSkill = Awaited<ReturnType<MissionRepository["findMainMissions"]>>[number];

type ScheduleBlockWithMissions = Awaited<ReturnType<ScheduleRepository["findBlocksByCharacter"]>>[number];

export type CharacterAgenda = {
  dayType: DayScheduleType;
  date: string;
  isFreeDay: boolean;
  freeDayLabel?: string | null;
  blocks: Array<
    Omit<ScheduleBlockWithMissions, "missions"> & {
      missions: EnrichedMission[];
      isCurrent: boolean;
    }
  >;
};

export type EnrichedMission = MissionWithSkill & {
  periodKey: string;
  completed: boolean;
  questionnaireState?: QuestionnaireState;
  activeQuestionnaire?: { id: string; title: string; questionCount: number };
};

export type CharacterMissionOverview = {
  agenda: CharacterAgenda;
  sideQuests: EnrichedMission[];
  weeklyMissions: EnrichedMission[];
};

export class MissionService {
  private _streakService?: StreakService;

  constructor(
    private missionRepo = new MissionRepository(),
    private questionnaireRepo = new QuestionnaireRepository(),
    private scheduleRepo = new ScheduleRepository(),
    private freeDayRepo = new FreeDayRepository(),
    private characterService = new CharacterService(),
    private achievementService = new AchievementService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  private get streakService() {
    return (this._streakService ??= new StreakService());
  }

  async getMissions(familyId?: string) {
    return this.missionRepo.findAll(familyId);
  }

  async getMissionsForCharacter(characterId: string, familyId?: string) {
    const missions = await this.missionRepo.findMainMissions(familyId);
    return this.enrichMissionsForCharacter(missions, characterId);
  }

  async getSideQuestsForCharacter(characterId: string, familyId?: string) {
    const missions = await this.missionRepo.findSideQuests(familyId);
    return this.enrichMissionsForCharacter(missions, characterId);
  }

  async getCharacterMissionOverview(
    characterId: string,
    familyId: string,
    date: Date = new Date()
  ): Promise<CharacterMissionOverview> {
    const [freeDay, sideQuestMissions, weeklyMissionList] = await Promise.all([
      this.freeDayRepo.findByFamilyAndDate(familyId, date),
      this.missionRepo.findSideQuests(familyId),
      this.missionRepo.findMainMissionsByFrequency(familyId, "WEEKLY"),
    ]);

    if (freeDay) {
      const enriched = await this.enrichMissionsForCharacter(
        this.uniqueMissions([...sideQuestMissions, ...weeklyMissionList]),
        characterId
      );
      const enrichedById = new Map(enriched.map((mission) => [mission.id, mission]));

      return {
        agenda: {
          dayType: getDayScheduleType(date),
          date: date.toISOString(),
          isFreeDay: true,
          freeDayLabel: freeDay.label,
          blocks: [],
        },
        sideQuests: sideQuestMissions.map((mission) => enrichedById.get(mission.id)!),
        weeklyMissions: weeklyMissionList.map((mission) => enrichedById.get(mission.id)!),
      };
    }

    const blocks = await this.resolveScheduleBlocks(characterId, date);

    const agendaMissions = blocks.flatMap((block) =>
      block.missions.map((link) => link.mission)
    );
    const enriched = await this.enrichMissionsForCharacter(
      this.uniqueMissions([...agendaMissions, ...sideQuestMissions, ...weeklyMissionList]),
      characterId
    );
    const enrichedById = new Map(enriched.map((mission) => [mission.id, mission]));

    return {
      agenda: {
        dayType: getDayScheduleType(date),
        date: date.toISOString(),
        isFreeDay: false,
        blocks: blocks.map((block) => ({
          ...block,
          missions: block.missions.map((link) => enrichedById.get(link.mission.id)!),
          isCurrent: isTimeInBlock(date, block.startTime, block.endTime),
        })),
      },
      sideQuests: sideQuestMissions.map((mission) => enrichedById.get(mission.id)!),
      weeklyMissions: weeklyMissionList.map((mission) => enrichedById.get(mission.id)!),
    };
  }

  private uniqueMissions(missions: MissionWithSkill[]) {
    const missionsById = new Map<string, MissionWithSkill>();
    for (const mission of missions) {
      missionsById.set(mission.id, mission);
    }
    return [...missionsById.values()];
  }

  private async resolveScheduleBlocks(characterId: string, date: Date) {
    const dayType = getDayScheduleType(date);
    let blocks = await this.scheduleRepo.findBlocksByCharacter(characterId, dayType);

    if (blocks.length === 0 && dayType === "FRIDAY") {
      blocks = await this.scheduleRepo.findBlocksByCharacter(characterId, "WEEKDAY");
    }

    return blocks;
  }

  async enrichMissionsForCharacter(
    missions: MissionWithSkill[],
    characterId: string
  ): Promise<EnrichedMission[]> {
    if (missions.length === 0) {
      return [];
    }

    const progressRefs = missions.map((mission) => ({
      missionId: mission.id,
      periodKey: getPeriodKey(mission.frequency),
    }));
    const completionMap = await this.missionRepo.getCompletionMap(characterId, progressRefs);

    const questionnaireMissionIds = missions
      .filter((mission) => {
        if (mission.type !== "QUESTIONNAIRE") return false;
        const periodKey = getPeriodKey(mission.frequency);
        return !completionMap.get(missionProgressKey(mission.id, periodKey));
      })
      .map((mission) => mission.id);

    const activeQuestionnaires = await this.questionnaireRepo.findActiveSummariesForMissions(
      questionnaireMissionIds,
      characterId
    );

    return missions.map((mission) => {
      const periodKey = getPeriodKey(mission.frequency);
      const completed = completionMap.get(missionProgressKey(mission.id, periodKey)) ?? false;
      const base: EnrichedMission = { ...mission, periodKey, completed };

      if (mission.type !== "QUESTIONNAIRE") {
        return base;
      }

      if (completed) {
        return { ...base, questionnaireState: "completed_period" };
      }

      const activeQuestionnaire = activeQuestionnaires.get(mission.id);
      if (activeQuestionnaire) {
        return {
          ...base,
          questionnaireState: "available",
          activeQuestionnaire,
        };
      }

      return { ...base, questionnaireState: "waiting" };
    });
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

    const { levelUp } = await this.characterService.addXp(
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

    const { streak, morningCombo } = await this.streakService.evaluateAfterRouteMission(
      characterId,
      missionId,
      {
        isSideQuest: resolvedMission.isSideQuest,
        frequency: resolvedMission.frequency,
      }
    );

    return { progress, levelUp, streak, morningCombo };
  }
}
