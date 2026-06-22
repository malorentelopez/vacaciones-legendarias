import { RewardRepository } from "../repositories/reward.repository";
import { CharacterRepository } from "../repositories/character.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import type { RewardStatus } from "@repo/database";

export class RewardService {
  constructor(
    private rewardRepo = new RewardRepository(),
    private characterRepo = new CharacterRepository(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getRewards(familyId?: string) {
    return this.rewardRepo.findAll(familyId);
  }

  async createReward(data: Parameters<RewardRepository["create"]>[0]) {
    return this.rewardRepo.create(data);
  }

  async updateReward(id: string, data: Parameters<RewardRepository["update"]>[1]) {
    return this.rewardRepo.update(id, data);
  }

  async deleteReward(id: string) {
    return this.rewardRepo.delete(id);
  }

  async purchaseReward(rewardId: string, characterId: string) {
    const reward = await this.rewardRepo.findById(rewardId);
    if (!reward) throw new Error("Recompensa no encontrada");

    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    if (character.crystals < reward.crystalCost) {
      throw new Error("Cristales insuficientes");
    }

    await this.characterRepo.update(characterId, {
      crystals: character.crystals - reward.crystalCost,
    });

    await this.rewardRepo.addCrystalTransaction(
      characterId,
      -reward.crystalCost,
      `Compra: ${reward.title}`
    );

    await this.gameEventRepo.create(characterId, "CRYSTALS_SPENT", {
      amount: reward.crystalCost,
      rewardId,
      rewardTitle: reward.title,
    });

    return this.rewardRepo.createPurchase(rewardId, characterId);
  }

  async getPurchases(characterId?: string, status?: RewardStatus) {
    return this.rewardRepo.getPurchases(characterId, status);
  }

  async updatePurchaseStatus(purchaseId: string, status: RewardStatus) {
    return this.rewardRepo.updatePurchaseStatus(purchaseId, status);
  }
}
