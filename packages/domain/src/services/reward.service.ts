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

  async getStoreRewards(familyId: string, characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");
    return this.rewardRepo.findAllForStore(familyId, characterId, character.level);
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

    if (reward.maxPurchases != null) {
      const purchases = await this.rewardRepo.countPurchases(rewardId, characterId);
      if (purchases >= reward.maxPurchases) {
        throw new Error("Ya has conseguido esta recompensa");
      }
    }

    if (reward.requiredLevel != null && character.level < reward.requiredLevel) {
      throw new Error(`Necesitas alcanzar el nivel ${reward.requiredLevel} para esta recompensa`);
    }

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

  async getFamilyPurchases(familyId: string, status?: RewardStatus) {
    return this.rewardRepo.getFamilyPurchases(familyId, status);
  }

  async getPurchases(characterId?: string, status?: RewardStatus) {
    return this.rewardRepo.getPurchases(characterId, status);
  }

  async updatePurchaseStatus(purchaseId: string, status: RewardStatus, familyId?: string) {
    const purchase = await this.rewardRepo.findPurchaseById(purchaseId);
    if (!purchase) throw new Error("Compra no encontrada");

    if (familyId && purchase.character.familyId !== familyId) {
      throw new Error("Compra no encontrada");
    }

    if (purchase.status === status) {
      return purchase;
    }

    if (purchase.status === "REJECTED" || purchase.status === "DELIVERED") {
      throw new Error("Esta compra ya está cerrada");
    }

    if (status === "REJECTED" && purchase.status === "PENDING") {
      await this.characterRepo.update(purchase.characterId, {
        crystals: purchase.character.crystals + purchase.reward.crystalCost,
      });

      await this.rewardRepo.addCrystalTransaction(
        purchase.characterId,
        purchase.reward.crystalCost,
        `Reembolso: ${purchase.reward.title}`
      );

      await this.gameEventRepo.create(purchase.characterId, "CRYSTALS_GAINED", {
        amount: purchase.reward.crystalCost,
        reason: `Reembolso por compra rechazada: ${purchase.reward.title}`,
        purchaseId,
      });
    }

    return this.rewardRepo.updatePurchaseStatus(purchaseId, status);
  }
}
