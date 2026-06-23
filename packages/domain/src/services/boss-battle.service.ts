import { BossBattleRepository } from "../repositories/skill.repository";
import { CharacterService } from "./character.service";
import { GameEventRepository } from "../repositories/game-event.repository";
import type { LevelUpInfo } from "../types/game-feedback";

export class BossBattleService {
  constructor(
    private bossRepo = new BossBattleRepository(),
    private characterService = new CharacterService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getBossBattles(familyId?: string) {
    return this.bossRepo.findAll(familyId);
  }

  async createBossBattle(data: Parameters<BossBattleRepository["create"]>[0]) {
    return this.bossRepo.create(data);
  }

  async updateBossBattle(id: string, data: Parameters<BossBattleRepository["update"]>[1]) {
    return this.bossRepo.update(id, data);
  }

  async deleteBossBattle(id: string) {
    return this.bossRepo.delete(id);
  }

  async addObjective(bossBattleId: string, data: { title: string; description?: string; targetDate?: Date; order?: number }) {
    return this.bossRepo.addObjective(bossBattleId, data);
  }

  async updateObjective(id: string, data: { title?: string; description?: string | null }) {
    return this.bossRepo.updateObjective(id, data);
  }

  async deleteObjective(id: string) {
    return this.bossRepo.deleteObjective(id);
  }

  async completeObjective(objectiveId: string, characterId: string) {
    const objective = await this.bossRepo.completeObjective(objectiveId);
    const boss = await this.bossRepo.findById(objective.bossBattleId);
    if (!boss) throw new Error("Boss no encontrado");

    const allCompleted = boss.objectives.every(
      (o) => o.id === objectiveId || o.completed
    );

    let levelUp: LevelUpInfo | null = null;
    let bossCompleted = false;

    if (allCompleted) {
      bossCompleted = true;
      const xpResult = await this.characterService.addXp(characterId, boss.xpReward);
      levelUp = xpResult.levelUp;
      if (boss.crystalReward > 0) {
        await this.characterService.addCrystals(
          characterId,
          boss.crystalReward,
          `Boss completado: ${boss.title}`
        );
      }
      await this.gameEventRepo.create(characterId, "BOSS_COMPLETED", {
        bossId: boss.id,
        title: boss.title,
      });
    }

    return { objective, bossCompleted, levelUp, boss: bossCompleted ? boss : null };
  }
}
