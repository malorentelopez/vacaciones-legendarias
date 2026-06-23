import { prisma } from "@repo/database";
import {
  projectEconomy,
  type EconomyProjection,
  type MissionInput,
  type ProgressScenario,
  SCENARIO_RATES,
  weeksToAffordReward,
  buildRewardWarnings,
  getRewardTier,
  calculateWeeklyIncome,
} from "../utils/crystal-projection";

const HISTORICAL_WEEKS = 4;

export class CrystalEconomyService {
  async getProjection(familyId: string): Promise<EconomyProjection> {
    const [missions, levels, achievements, bosses, rewards, historical] = await Promise.all([
      prisma.mission.findMany({
        where: { isActive: true, OR: [{ familyId }, { familyId: null }] },
        select: {
          crystalReward: true,
          xpReward: true,
          frequency: true,
          isSideQuest: true,
        },
      }),
      prisma.levelConfiguration.findMany({
        orderBy: { level: "asc" },
        select: { level: true, xpRequired: true, crystalReward: true },
      }),
      prisma.achievement.findMany({
        where: { isActive: true, OR: [{ familyId }, { familyId: null }] },
        select: { crystalReward: true, isManual: true },
      }),
      prisma.bossBattle.findMany({
        where: { isActive: true, OR: [{ familyId }, { familyId: null }] },
        select: { crystalReward: true },
      }),
      prisma.reward.findMany({
        where: { isActive: true, OR: [{ familyId }, { familyId: null }] },
        select: { id: true, title: true, crystalCost: true, maxPurchases: true },
        orderBy: { crystalCost: "asc" },
      }),
      this.getHistoricalStats(familyId),
    ]);

    const missionInputs: MissionInput[] = missions.map((mission) => ({
      crystalReward: mission.crystalReward,
      xpReward: mission.xpReward,
      frequency: mission.frequency,
      isSideQuest: mission.isSideQuest,
    }));

    return projectEconomy({
      missions: missionInputs,
      levels,
      achievements,
      bosses,
      rewards,
      historical,
    });
  }

  async getRewardPreview(
    familyId: string,
    crystalCost: number,
    maxPurchases: number | null = null
  ) {
    const projection = await this.getProjection(familyId);
    const normalWeekly = projection.scenarios.normal.weeklyIncome.total;

    const weeksByScenario = {} as Record<ProgressScenario, number>;
    for (const scenario of Object.keys(SCENARIO_RATES) as ProgressScenario[]) {
      weeksByScenario[scenario] = weeksToAffordReward(
        crystalCost,
        projection.scenarios[scenario].weeklyIncome.total
      );
    }

    return {
      weeklyIncome: projection.scenarios.normal.weeklyIncome,
      weeksToAfford: weeksByScenario,
      tier: getRewardTier(weeksByScenario.normal),
      warnings: buildRewardWarnings(crystalCost, weeksByScenario.normal, maxPurchases),
      historicalWeeks:
        projection.historical && projection.historical.avgWeeklyEarned > 0
          ? weeksToAffordReward(crystalCost, projection.historical.avgWeeklyEarned)
          : null,
      monthlySharePercent:
        normalWeekly > 0 ? Math.round((crystalCost / (normalWeekly * (30 / 7))) * 1000) / 10 : 0,
    };
  }

  private async getHistoricalStats(familyId: string) {
    const since = new Date();
    since.setDate(since.getDate() - HISTORICAL_WEEKS * 7);

    const events = await prisma.gameEvent.findMany({
      where: {
        character: { familyId },
        type: { in: ["CRYSTALS_GAINED", "CRYSTALS_SPENT"] },
        createdAt: { gte: since },
      },
      select: { type: true, payload: true, createdAt: true },
    });

    if (events.length === 0) return undefined;

    let earned = 0;
    let spent = 0;

    for (const event of events) {
      const payload = event.payload as { amount?: number };
      const amount = typeof payload.amount === "number" ? payload.amount : 0;
      if (event.type === "CRYSTALS_GAINED") earned += amount;
      if (event.type === "CRYSTALS_SPENT") spent += Math.abs(amount);
    }

    return {
      avgWeeklyEarned: Math.round((earned / HISTORICAL_WEEKS) * 10) / 10,
      avgWeeklySpent: Math.round((spent / HISTORICAL_WEEKS) * 10) / 10,
      weeksOfData: HISTORICAL_WEEKS,
    };
  }
}

export { calculateWeeklyIncome };
