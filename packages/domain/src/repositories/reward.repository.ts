import { prisma } from "@repo/database";
import type { RewardStatus } from "@repo/database";

export class RewardRepository {
  async findAll(familyId?: string) {
    return prisma.reward.findMany({
      where: {
        isActive: true,
        OR: [{ familyId }, { familyId: null }],
      },
      orderBy: { crystalCost: "asc" },
    });
  }

  async findAllForStore(familyId: string, characterId: string, characterLevel: number) {
    const rewards = await this.findAll(familyId);
    const purchaseCounts = await prisma.rewardPurchase.groupBy({
      by: ["rewardId"],
      where: {
        characterId,
        status: { not: "REJECTED" },
      },
      _count: { _all: true },
    });
    const countByReward = new Map(purchaseCounts.map((row) => [row.rewardId, row._count._all]));

    return rewards.map((reward) => ({
      ...reward,
      purchaseCount: countByReward.get(reward.id) ?? 0,
      isExhausted:
        reward.maxPurchases != null &&
        (countByReward.get(reward.id) ?? 0) >= reward.maxPurchases,
      isLevelLocked:
        reward.requiredLevel != null && characterLevel < reward.requiredLevel,
    }));
  }

  async countPurchases(rewardId: string, characterId: string) {
    return prisma.rewardPurchase.count({
      where: {
        rewardId,
        characterId,
        status: { not: "REJECTED" },
      },
    });
  }

  async findById(id: string) {
    return prisma.reward.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    description?: string;
    crystalCost: number;
    maxPurchases?: number | null;
    requiredLevel?: number | null;
    icon?: string;
    familyId?: string;
  }) {
    return prisma.reward.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      crystalCost: number;
      maxPurchases: number | null;
      requiredLevel: number | null;
      icon: string;
      isActive: boolean;
    }>
  ) {
    return prisma.reward.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.reward.delete({ where: { id } });
  }

  async createPurchase(rewardId: string, characterId: string) {
    return prisma.rewardPurchase.create({
      data: { rewardId, characterId, status: "PENDING" },
      include: { reward: true },
    });
  }

  async updatePurchaseStatus(id: string, status: RewardStatus) {
    const data: { status: RewardStatus; approvedAt?: Date; deliveredAt?: Date } = { status };
    if (status === "APPROVED") data.approvedAt = new Date();
    if (status === "DELIVERED") data.deliveredAt = new Date();

    return prisma.rewardPurchase.update({
      where: { id },
      data,
      include: { reward: true, character: true },
    });
  }

  async findPurchaseById(id: string) {
    return prisma.rewardPurchase.findUnique({
      where: { id },
      include: {
        reward: true,
        character: { select: { id: true, name: true, familyId: true, crystals: true } },
      },
    });
  }

  async getFamilyPurchases(familyId: string, status?: RewardStatus) {
    return prisma.rewardPurchase.findMany({
      where: {
        character: { familyId },
        ...(status ? { status } : {}),
      },
      include: {
        reward: true,
        character: { select: { name: true } },
      },
      orderBy: { purchasedAt: "desc" },
    });
  }

  async getPurchases(characterId?: string, status?: RewardStatus) {
    return prisma.rewardPurchase.findMany({
      where: {
        ...(characterId ? { characterId } : {}),
        ...(status ? { status } : {}),
      },
      include: { reward: true, character: true },
      orderBy: { purchasedAt: "desc" },
    });
  }

  async addCrystalTransaction(characterId: string, amount: number, reason: string) {
    return prisma.crystalTransaction.create({
      data: { characterId, amount, reason },
    });
  }
}
