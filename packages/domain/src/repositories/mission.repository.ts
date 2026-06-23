import { prisma } from "@repo/database";
import type { MissionFrequency, MissionType } from "@repo/database";

export class MissionRepository {
  async findAll(familyId?: string) {
    return prisma.mission.findMany({
      where: {
        isActive: true,
        OR: [{ familyId }, { familyId: null }],
      },
      include: { skill: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findMainMissions(familyId?: string) {
    return prisma.mission.findMany({
      where: {
        isActive: true,
        isSideQuest: false,
        OR: [{ familyId }, { familyId: null }],
      },
      include: { skill: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findSideQuests(familyId?: string) {
    return prisma.mission.findMany({
      where: {
        isActive: true,
        isSideQuest: true,
        OR: [{ familyId }, { familyId: null }],
      },
      include: { skill: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.mission.findUnique({
      where: { id },
      include: { skill: true },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    frequency: MissionFrequency;
    type: MissionType;
    xpReward: number;
    crystalReward?: number;
    skillId?: string;
    familyId?: string;
    isSideQuest?: boolean;
  }) {
    return prisma.mission.create({ data, include: { skill: true } });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      frequency: MissionFrequency;
      type: MissionType;
      xpReward: number;
      crystalReward: number;
      skillId: string | null;
      isActive: boolean;
      isSideQuest: boolean;
    }>
  ) {
    return prisma.mission.update({
      where: { id },
      data,
      include: { skill: true },
    });
  }

  async delete(id: string) {
    return prisma.mission.delete({ where: { id } });
  }

  async getProgress(characterId: string, periodKey: string) {
    return prisma.missionProgress.findMany({
      where: { characterId, periodKey },
      include: { mission: { include: { skill: true } } },
    });
  }

  async completeMission(missionId: string, characterId: string, periodKey: string) {
    return prisma.missionProgress.upsert({
      where: {
        missionId_characterId_periodKey: { missionId, characterId, periodKey },
      },
      update: { completed: true, completedAt: new Date() },
      create: {
        missionId,
        characterId,
        periodKey,
        completed: true,
        completedAt: new Date(),
      },
      include: { mission: { include: { skill: true } } },
    });
  }

  async isCompleted(missionId: string, characterId: string, periodKey: string) {
    const progress = await prisma.missionProgress.findUnique({
      where: {
        missionId_characterId_periodKey: { missionId, characterId, periodKey },
      },
    });
    return progress?.completed ?? false;
  }
}
