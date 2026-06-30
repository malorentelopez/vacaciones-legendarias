import { ScheduleRepository } from "../repositories/schedule.repository";
import { FreeDayRepository } from "../repositories/free-day.repository";
import { MissionRepository } from "../repositories/mission.repository";
import { CharacterRepository } from "../repositories/character.repository";
import { MissionService } from "./mission.service";
import { getPeriodKey } from "../utils/period";
import { getDayScheduleType, isTimeInBlock } from "../utils/schedule";
import {
  characterMissionProgressKey,
  type CharacterMissionProgressRef,
} from "../utils/mission-progress";
import type { DayScheduleType } from "@repo/database";

export type TodayMissionSummary = {
  characterId: string;
  completed: number;
  total: number;
  isFreeDay: boolean;
  freeDayLabel: string | null;
};

export class ScheduleService {
  constructor(
    private scheduleRepo = new ScheduleRepository(),
    private freeDayRepo = new FreeDayRepository(),
    private missionRepo = new MissionRepository(),
    private characterRepo = new CharacterRepository(),
    private missionService = new MissionService()
  ) {}

  async getBlocksForCharacter(characterId: string, dayType: DayScheduleType) {
    await this.assertCharacterExists(characterId);
    return this.scheduleRepo.findBlocksByCharacter(characterId, dayType);
  }

  async getFreeDaysForMonth(familyId: string, year: number, month: number) {
    return this.freeDayRepo.findByFamilyAndMonth(familyId, year, month);
  }

  async toggleFreeDay(familyId: string, dateKey: string, label?: string) {
    return this.freeDayRepo.toggle(familyId, dateKey, label);
  }

  async getTodayMissionSummariesForFamily(
    familyId: string,
    date: Date = new Date()
  ): Promise<TodayMissionSummary[]> {
    const characters = await this.characterRepo.findByFamilyForDashboard(familyId);
    const characterIds = characters.map((character) => character.id);

    if (characterIds.length === 0) {
      return [];
    }

    const freeDay = await this.freeDayRepo.findByFamilyAndDate(familyId, date);
    if (freeDay) {
      return characterIds.map((characterId) => ({
        characterId,
        completed: 0,
        total: 0,
        isFreeDay: true,
        freeDayLabel: freeDay.label,
      }));
    }

    const dayType = getDayScheduleType(date);
    let blocks = await this.scheduleRepo.findBlocksByCharacterIds(characterIds, dayType);

    if (dayType === "FRIDAY") {
      const charactersWithBlocks = new Set(blocks.map((block) => block.characterId));
      const missingFriday = characterIds.filter((id) => !charactersWithBlocks.has(id));
      if (missingFriday.length > 0) {
        const weekdayBlocks = await this.scheduleRepo.findBlocksByCharacterIds(
          missingFriday,
          "WEEKDAY"
        );
        blocks = [...blocks, ...weekdayBlocks];
      }
    }

    const progressRefs: CharacterMissionProgressRef[] = [];
    const missionsByCharacter = new Map<string, { missionId: string; periodKey: string }[]>();

    for (const block of blocks) {
      for (const link of block.missions) {
        const periodKey = getPeriodKey(link.mission.frequency, date);
        const missions = missionsByCharacter.get(block.characterId) ?? [];
        missions.push({ missionId: link.mission.id, periodKey });
        missionsByCharacter.set(block.characterId, missions);
        progressRefs.push({
          characterId: block.characterId,
          missionId: link.mission.id,
          periodKey,
        });
      }
    }

    const completionMap = await this.missionRepo.getFamilyCompletionMap(progressRefs);

    return characterIds.map((characterId) => {
      const missions = missionsByCharacter.get(characterId) ?? [];
      const completed = missions.filter((mission) =>
        completionMap.get(
          characterMissionProgressKey(characterId, mission.missionId, mission.periodKey)
        )
      ).length;

      return {
        characterId,
        completed,
        total: missions.length,
        isFreeDay: false,
        freeDayLabel: null,
      };
    });
  }

  async getAgendaForCharacter(characterId: string, date: Date = new Date()) {
    const character = await this.assertCharacterExists(characterId);

    const freeDay = await this.freeDayRepo.findByFamilyAndDate(character.familyId, date);
    if (freeDay) {
      return {
        dayType: getDayScheduleType(date),
        date: date.toISOString(),
        isFreeDay: true as const,
        freeDayLabel: freeDay.label,
        blocks: [],
      };
    }

    const dayType = getDayScheduleType(date);
    let blocks = await this.scheduleRepo.findBlocksByCharacter(characterId, dayType);

    if (blocks.length === 0 && dayType === "FRIDAY") {
      blocks = await this.scheduleRepo.findBlocksByCharacter(characterId, "WEEKDAY");
    }

    const missionsById = new Map<string, (typeof blocks)[number]["missions"][number]["mission"]>();
    for (const block of blocks) {
      for (const link of block.missions) {
        missionsById.set(link.mission.id, link.mission);
      }
    }

    const enrichedMissions = await this.missionService.enrichMissionsForCharacter(
      [...missionsById.values()],
      characterId
    );
    const enrichedById = new Map(enrichedMissions.map((mission) => [mission.id, mission]));

    const agendaBlocks = blocks.map((block) => ({
      ...block,
      missions: block.missions.map((link) => enrichedById.get(link.mission.id)!),
      isCurrent: isTimeInBlock(date, block.startTime, block.endTime),
    }));

    return {
      dayType,
      date: date.toISOString(),
      isFreeDay: false as const,
      blocks: agendaBlocks,
    };
  }

  async createBlock(data: Parameters<ScheduleRepository["createBlock"]>[0]) {
    await this.assertCharacterExists(data.characterId);
    return this.scheduleRepo.createBlock(data);
  }

  async updateBlock(id: string, data: Parameters<ScheduleRepository["updateBlock"]>[1]) {
    return this.scheduleRepo.updateBlock(id, data);
  }

  async deleteBlock(id: string) {
    return this.scheduleRepo.deleteBlock(id);
  }

  async setBlockMissions(scheduleBlockId: string, missionIds: string[]) {
    return this.scheduleRepo.setBlockMissions(scheduleBlockId, missionIds);
  }

  async reorderBlocks(characterId: string, dayType: DayScheduleType, orderedIds: string[]) {
    await this.assertCharacterExists(characterId);
    await this.scheduleRepo.reorderBlocks(characterId, dayType, orderedIds);
    return this.scheduleRepo.findBlocksByCharacter(characterId, dayType);
  }

  private async assertCharacterExists(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");
    return character;
  }
}
