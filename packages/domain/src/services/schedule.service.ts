import { ScheduleRepository } from "../repositories/schedule.repository";
import { MissionRepository } from "../repositories/mission.repository";
import { CharacterRepository } from "../repositories/character.repository";
import { getPeriodKey } from "../utils/period";
import { getDayScheduleType, isTimeInBlock } from "../utils/schedule";
import type { DayScheduleType } from "@repo/database";

export class ScheduleService {
  constructor(
    private scheduleRepo = new ScheduleRepository(),
    private missionRepo = new MissionRepository(),
    private characterRepo = new CharacterRepository()
  ) {}

  async getBlocksForCharacter(characterId: string, dayType: DayScheduleType) {
    await this.assertCharacterExists(characterId);
    return this.scheduleRepo.findBlocksByCharacter(characterId, dayType);
  }

  async getAgendaForCharacter(characterId: string, date: Date = new Date()) {
    await this.assertCharacterExists(characterId);
    const dayType = getDayScheduleType(date);
    const blocks = await this.scheduleRepo.findBlocksByCharacter(characterId, dayType);

    const agendaBlocks = [];
    for (const block of blocks) {
      const missions = [];
      for (const link of block.missions) {
        const periodKey = getPeriodKey(link.mission.frequency);
        const completed = await this.missionRepo.isCompleted(link.mission.id, characterId, periodKey);
        missions.push({
          ...link.mission,
          periodKey,
          completed,
        });
      }

      agendaBlocks.push({
        ...block,
        missions,
        isCurrent: isTimeInBlock(date, block.startTime, block.endTime),
      });
    }

    return {
      dayType,
      date: date.toISOString(),
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

  private async assertCharacterExists(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");
    return character;
  }
}
