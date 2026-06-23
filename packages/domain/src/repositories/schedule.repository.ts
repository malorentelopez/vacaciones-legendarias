import { prisma } from "@repo/database";
import type { DayScheduleType } from "@repo/database";

export class ScheduleRepository {
  async findBlocksByCharacter(characterId: string, dayType: DayScheduleType) {
    return prisma.scheduleBlock.findMany({
      where: { characterId, dayType, isActive: true },
      include: {
        missions: {
          include: { mission: { include: { skill: true } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ order: "asc" }, { startTime: "asc" }],
    });
  }

  async findBlockById(id: string) {
    return prisma.scheduleBlock.findUnique({
      where: { id },
      include: {
        missions: {
          include: { mission: { include: { skill: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async createBlock(data: {
    characterId: string;
    dayType: DayScheduleType;
    title: string;
    description?: string;
    icon?: string;
    startTime: string;
    endTime?: string;
    section?: string;
    order?: number;
  }) {
    return prisma.scheduleBlock.create({
      data,
      include: {
        missions: {
          include: { mission: { include: { skill: true } } },
        },
      },
    });
  }

  async updateBlock(
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      icon: string | null;
      startTime: string;
      endTime: string | null;
      section: string | null;
      order: number;
      isActive: boolean;
    }>
  ) {
    return prisma.scheduleBlock.update({
      where: { id },
      data,
      include: {
        missions: {
          include: { mission: { include: { skill: true } } },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async deleteBlock(id: string) {
    return prisma.scheduleBlock.delete({ where: { id } });
  }

  async assignMission(scheduleBlockId: string, missionId: string, order = 0) {
    return prisma.scheduleBlockMission.create({
      data: { scheduleBlockId, missionId, order },
      include: { mission: { include: { skill: true } } },
    });
  }

  async unassignMission(scheduleBlockId: string, missionId: string) {
    return prisma.scheduleBlockMission.delete({
      where: {
        scheduleBlockId_missionId: { scheduleBlockId, missionId },
      },
    });
  }

  async setBlockMissions(scheduleBlockId: string, missionIds: string[]) {
    await prisma.scheduleBlockMission.deleteMany({ where: { scheduleBlockId } });
    if (missionIds.length === 0) return [];
    await prisma.scheduleBlockMission.createMany({
      data: missionIds.map((missionId, order) => ({ scheduleBlockId, missionId, order })),
    });
    return prisma.scheduleBlockMission.findMany({
      where: { scheduleBlockId },
      include: { mission: { include: { skill: true } } },
      orderBy: { order: "asc" },
    });
  }

  async reorderBlocks(characterId: string, dayType: DayScheduleType, orderedIds: string[]) {
    const existing = await prisma.scheduleBlock.findMany({
      where: { characterId, dayType, isActive: true },
      select: { id: true },
      orderBy: [{ order: "asc" }, { startTime: "asc" }],
    });

    const existingIds = new Set(existing.map((b) => b.id));
    if (
      orderedIds.length !== existing.length ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new Error("Lista de bloques inválida");
    }

    await prisma.$transaction(
      orderedIds.map((id, order) =>
        prisma.scheduleBlock.update({
          where: { id },
          data: { order },
        })
      )
    );
  }
}
