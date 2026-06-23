import { prisma } from "@repo/database";

const achievementInclude = {
  requiredSkill: true,
  targetMission: true,
  missions: { include: { mission: true } },
} as const;

export class AchievementRepository {
  async findAll(familyId?: string) {
    return prisma.achievement.findMany({
      where: {
        isActive: true,
        OR: [{ familyId }, { familyId: null }],
      },
      include: achievementInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.achievement.findUnique({
      where: { id },
      include: achievementInclude,
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
    targetMissionId?: string;
    targetMissionCompletions?: number;
    crystalReward?: number;
    familyId?: string;
    missionIds?: string[];
  }) {
    const { missionIds, ...achievementData } = data;

    return prisma.achievement.create({
      data: {
        ...achievementData,
        missions: missionIds?.length
          ? { create: missionIds.map((missionId) => ({ missionId })) }
          : undefined,
      },
      include: achievementInclude,
    });
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
      targetMissionId: string | null;
      targetMissionCompletions: number | null;
      crystalReward: number;
      isActive: boolean;
    }> & { missionIds?: string[] }
  ) {
    const { missionIds, ...updateData } = data;

    if (missionIds !== undefined) {
      await prisma.achievementMission.deleteMany({ where: { achievementId: id } });
      if (missionIds.length > 0) {
        await prisma.achievementMission.createMany({
          data: missionIds.map((missionId) => ({ achievementId: id, missionId })),
        });
      }
    }

    return prisma.achievement.update({
      where: { id },
      data: updateData,
      include: achievementInclude,
    });
  }

  async delete(id: string) {
    return prisma.achievement.delete({ where: { id } });
  }

  async getCharacterAchievements(characterId: string) {
    return prisma.characterAchievement.findMany({
      where: { characterId },
      include: { achievement: { include: achievementInclude } },
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
      include: { achievement: { include: achievementInclude } },
    });
  }

  async claim(characterId: string, achievementId: string) {
    const record = await prisma.characterAchievement.findUnique({
      where: {
        characterId_achievementId: { characterId, achievementId },
      },
      include: { achievement: true },
    });

    if (!record) throw new Error("Logro no completado");
    if (record.claimedAt) throw new Error("Logro ya reclamado");

    return prisma.characterAchievement.update({
      where: { id: record.id },
      data: { claimedAt: new Date() },
      include: { achievement: { include: achievementInclude } },
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

  async isClaimed(characterId: string, achievementId: string) {
    const record = await prisma.characterAchievement.findUnique({
      where: {
        characterId_achievementId: { characterId, achievementId },
      },
      select: { claimedAt: true },
    });
    return !!record?.claimedAt;
  }
}
