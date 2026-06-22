import { prisma } from "@repo/database";

export class AchievementRepository {
  async findAll(familyId?: string) {
    return prisma.achievement.findMany({
      where: {
        isActive: true,
        OR: [{ familyId }, { familyId: null }],
      },
      include: { requiredSkill: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.achievement.findUnique({
      where: { id },
      include: { requiredSkill: true },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    icon?: string;
    requiredLevel?: number;
    requiredMissions?: number;
    requiredSkillId?: string;
    requiredSkillXp?: number;
    crystalReward?: number;
    familyId?: string;
  }) {
    return prisma.achievement.create({ data, include: { requiredSkill: true } });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      icon: string;
      requiredLevel: number | null;
      requiredMissions: number | null;
      requiredSkillId: string | null;
      requiredSkillXp: number | null;
      crystalReward: number;
      isActive: boolean;
    }>
  ) {
    return prisma.achievement.update({
      where: { id },
      data,
      include: { requiredSkill: true },
    });
  }

  async delete(id: string) {
    return prisma.achievement.delete({ where: { id } });
  }

  async getCharacterAchievements(characterId: string) {
    return prisma.characterAchievement.findMany({
      where: { characterId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });
  }

  async unlock(characterId: string, achievementId: string) {
    return prisma.characterAchievement.upsert({
      where: {
        characterId_achievementId: { characterId, achievementId },
      },
      update: {},
      create: { characterId, achievementId },
      include: { achievement: true },
    });
  }

  async isUnlocked(characterId: string, achievementId: string) {
    const record = await prisma.characterAchievement.findUnique({
      where: {
        characterId_achievementId: { characterId, achievementId },
      },
    });
    return !!record;
  }
}
