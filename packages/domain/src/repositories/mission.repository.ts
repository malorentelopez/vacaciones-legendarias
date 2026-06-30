import { prisma } from "@repo/database/prisma";
import type { MissionFrequency, MissionType } from "@repo/database";
import {
  characterMissionProgressKey,
  dedupeCharacterMissionProgressRefs,
  dedupeMissionProgressRefs,
  missionProgressKey,
  type CharacterMissionProgressRef,
  type MissionProgressRef,
} from "../utils/mission-progress";

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

  async findMainMissionsByFrequency(familyId: string | undefined, frequency: MissionFrequency) {
    return prisma.mission.findMany({
      where: {
        isActive: true,
        isSideQuest: false,
        frequency,
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

  async getCompletionMap(characterId: string, items: MissionProgressRef[]) {
    const refs = dedupeMissionProgressRefs(items);
    const result = new Map<string, boolean>();

    for (const ref of refs) {
      result.set(missionProgressKey(ref.missionId, ref.periodKey), false);
    }

    if (refs.length === 0) {
      return result;
    }

    const rows = await prisma.missionProgress.findMany({
      where: {
        characterId,
        OR: refs.map(({ missionId, periodKey }) => ({ missionId, periodKey })),
      },
      select: { missionId: true, periodKey: true, completed: true },
    });

    for (const row of rows) {
      result.set(missionProgressKey(row.missionId, row.periodKey), row.completed);
    }

    return result;
  }

  async getFamilyCompletionMap(items: CharacterMissionProgressRef[]) {
    const refs = dedupeCharacterMissionProgressRefs(items);
    const result = new Map<string, boolean>();

    for (const ref of refs) {
      result.set(
        characterMissionProgressKey(ref.characterId, ref.missionId, ref.periodKey),
        false
      );
    }

    if (refs.length === 0) {
      return result;
    }

    const characterIds = [...new Set(refs.map((ref) => ref.characterId))];
    const rows = await prisma.missionProgress.findMany({
      where: {
        characterId: { in: characterIds },
        OR: refs.map(({ characterId, missionId, periodKey }) => ({
          characterId,
          missionId,
          periodKey,
        })),
      },
      select: { characterId: true, missionId: true, periodKey: true, completed: true },
    });

    for (const row of rows) {
      result.set(
        characterMissionProgressKey(row.characterId, row.missionId, row.periodKey),
        row.completed
      );
    }

    return result;
  }
}
