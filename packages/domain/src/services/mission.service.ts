import { MissionRepository } from "../repositories/mission.repository";
import { CharacterService } from "./character.service";
import { AchievementService } from "./achievement.service";
import { GameEventRepository } from "../repositories/game-event.repository";
import { getPeriodKey } from "../utils/period";

export class MissionService {
  constructor(
    private missionRepo = new MissionRepository(),
    private characterService = new CharacterService(),
    private achievementService = new AchievementService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getMissions(familyId?: string) {
    return this.missionRepo.findAll(familyId);
  }

  async getMissionsForCharacter(characterId: string, familyId?: string) {
    const missions = await this.missionRepo.findAll(familyId);
    const result = [];

    for (const mission of missions) {
      const periodKey = getPeriodKey(mission.frequency);
      const completed = await this.missionRepo.isCompleted(mission.id, characterId, periodKey);
      result.push({ ...mission, periodKey, completed });
    }

    return result;
  }

  async createMission(data: Parameters<MissionRepository["create"]>[0]) {
    return this.missionRepo.create(data);
  }

  async updateMission(id: string, data: Parameters<MissionRepository["update"]>[1]) {
    return this.missionRepo.update(id, data);
  }

  async deleteMission(id: string) {
    return this.missionRepo.delete(id);
  }

  async completeMission(missionId: string, characterId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) throw new Error("Misión no encontrada");

    const periodKey = getPeriodKey(mission.frequency);
    const alreadyCompleted = await this.missionRepo.isCompleted(missionId, characterId, periodKey);
    if (alreadyCompleted) throw new Error("Misión ya completada en este periodo");

    const progress = await this.missionRepo.completeMission(missionId, characterId, periodKey);

    await this.gameEventRepo.create(characterId, "MISSION_COMPLETED", {
      missionId,
      missionTitle: mission.title,
      xpReward: mission.xpReward,
      crystalReward: mission.crystalReward,
    });

    await this.characterService.addXp(characterId, mission.xpReward, mission.skillId ?? undefined);

    if (mission.crystalReward > 0) {
      await this.characterService.addCrystals(
        characterId,
        mission.crystalReward,
        `Misión completada: ${mission.title}`
      );
    }

    await this.achievementService.evaluateAchievements(characterId);

    return progress;
  }
}
