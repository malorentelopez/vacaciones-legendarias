import { prisma } from "@repo/database/prisma";
import type { LevelConfiguration, ScreenTimeConfiguration } from "@repo/database";

let cachedLevels: LevelConfiguration[] | null = null;
let cachedScreenTimeConfigs: ScreenTimeConfiguration[] | null = null;

export function invalidateConfigurationCache() {
  cachedLevels = null;
  cachedScreenTimeConfigs = null;
}

export function resolveScreenTimeMinutes(
  weeklyPoints: number,
  configs: ScreenTimeConfiguration[]
): number {
  const match = configs.find(
    (config) =>
      weeklyPoints >= config.minWeeklyPoints && weeklyPoints <= config.maxWeeklyPoints
  );
  return match?.minutesAllowed ?? 30;
}

export class SkillRepository {
  async findAll() {
    return prisma.skill.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string) {
    return prisma.skill.findUnique({ where: { id } });
  }

  async create(data: { key: string; name: string; description?: string; icon?: string; color?: string }) {
    return prisma.skill.create({ data });
  }

  async update(
    id: string,
    data: Partial<{ name: string; description: string; icon: string; color: string }>
  ) {
    return prisma.skill.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.skill.delete({ where: { id } });
  }
}

export class ConfigurationRepository {
  async getLevelsUncached() {
    return prisma.levelConfiguration.findMany({ orderBy: { level: "asc" } });
  }

  async getLevels() {
    if (!cachedLevels) {
      cachedLevels = await this.getLevelsUncached();
    }
    return cachedLevels;
  }

  async upsertLevel(level: number, xpRequired: number, crystalReward = 0) {
    const result = await prisma.levelConfiguration.upsert({
      where: { level },
      update: { xpRequired, crystalReward },
      create: { level, xpRequired, crystalReward },
    });
    invalidateConfigurationCache();
    return result;
  }

  async deleteLevel(level: number) {
    const result = await prisma.levelConfiguration.delete({ where: { level } });
    invalidateConfigurationCache();
    return result;
  }

  async getScreenTimeConfigsUncached() {
    return prisma.screenTimeConfiguration.findMany({
      orderBy: { minWeeklyPoints: "asc" },
    });
  }

  async getScreenTimeConfigs() {
    if (!cachedScreenTimeConfigs) {
      cachedScreenTimeConfigs = await this.getScreenTimeConfigsUncached();
    }
    return cachedScreenTimeConfigs;
  }

  async upsertScreenTime(minWeeklyPoints: number, maxWeeklyPoints: number, minutesAllowed: number) {
    const existing = await prisma.screenTimeConfiguration.findFirst({
      where: { minWeeklyPoints },
    });
    const result = existing
      ? await prisma.screenTimeConfiguration.update({
          where: { id: existing.id },
          data: { maxWeeklyPoints, minutesAllowed },
        })
      : await prisma.screenTimeConfiguration.create({
          data: { minWeeklyPoints, maxWeeklyPoints, minutesAllowed },
        });
    invalidateConfigurationCache();
    return result;
  }

  async getPenaltyConfigs() {
    return prisma.penaltyConfiguration.findMany({ where: { isActive: true } });
  }

  async getStoreConfig(key: string) {
    return prisma.crystalStoreConfiguration.findUnique({ where: { key } });
  }
}

export class BossBattleRepository {
  async findAll(familyId?: string) {
    return prisma.bossBattle.findMany({
      where: {
        isActive: true,
        OR: [{ familyId }, { familyId: null }],
      },
      include: { objectives: { orderBy: { order: "asc" } } },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });
  }

  async findById(id: string) {
    return prisma.bossBattle.findUnique({
      where: { id },
      include: { objectives: { orderBy: { order: "asc" } } },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    month: number;
    year: number;
    xpReward?: number;
    crystalReward?: number;
    familyId?: string;
  }) {
    return prisma.bossBattle.create({ data, include: { objectives: true } });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      month: number;
      year: number;
      xpReward: number;
      crystalReward: number;
      isActive: boolean;
    }>
  ) {
    return prisma.bossBattle.update({
      where: { id },
      data,
      include: { objectives: { orderBy: { order: "asc" } } },
    });
  }

  async delete(id: string) {
    return prisma.bossBattle.delete({ where: { id } });
  }

  async completeObjective(objectiveId: string) {
    return prisma.bossObjective.update({
      where: { id: objectiveId },
      data: { completed: true, completedAt: new Date() },
    });
  }

  async addObjective(bossBattleId: string, data: { title: string; description?: string; targetDate?: Date; order?: number }) {
    return prisma.bossObjective.create({
      data: { bossBattleId, ...data },
    });
  }

  async updateObjective(
    id: string,
    data: Partial<{ title: string; description: string | null }>
  ) {
    return prisma.bossObjective.update({ where: { id }, data });
  }

  async deleteObjective(id: string) {
    return prisma.bossObjective.delete({ where: { id } });
  }
}
