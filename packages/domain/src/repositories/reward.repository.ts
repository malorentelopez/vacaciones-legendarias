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

  async findById(id: string) {
    return prisma.reward.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    description?: string;
    crystalCost: number;
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
