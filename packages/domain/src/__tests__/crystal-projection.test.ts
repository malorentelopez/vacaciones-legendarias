import { describe, it, expect } from "vitest";
import {
  calculateMissionWeeklyCrystals,
  calculateWeeklyIncome,
  getRewardTier,
  projectEconomy,
  SCENARIO_RATES,
  weeksToAffordReward,
} from "../utils/crystal-projection";

const demoMissions = [
  { crystalReward: 2, xpReward: 20, frequency: "DAILY" as const, isSideQuest: false },
  { crystalReward: 1, xpReward: 10, frequency: "DAILY" as const, isSideQuest: true },
  { crystalReward: 5, xpReward: 50, frequency: "WEEKLY" as const, isSideQuest: false },
];

const demoLevels = [
  { level: 1, xpRequired: 0, crystalReward: 0 },
  { level: 2, xpRequired: 100, crystalReward: 5 },
  { level: 3, xpRequired: 250, crystalReward: 10 },
];

describe("calculateMissionWeeklyCrystals", () => {
  it("applies completion rates for normal scenario", () => {
    const weekly = calculateMissionWeeklyCrystals(demoMissions, SCENARIO_RATES.normal);
    // 2*7*0.7 + 1*7*0.5 + 5*0.85 = 9.8 + 3.5 + 4.25 = 17.55
    expect(weekly).toBe(17.5);
  });
});

describe("calculateWeeklyIncome", () => {
  it("combines all income sources", () => {
    const income = calculateWeeklyIncome(
      demoMissions,
      demoLevels,
      [{ crystalReward: 20, isManual: false }],
      [{ crystalReward: 100 }],
      SCENARIO_RATES.normal
    );

    expect(income.missions).toBeGreaterThan(0);
    expect(income.achievements).toBe(2.5);
    expect(income.boss).toBeGreaterThan(0);
    expect(income.total).toBeGreaterThan(income.missions);
  });
});

describe("weeksToAffordReward", () => {
  it("calculates weeks from cost and income", () => {
    expect(weeksToAffordReward(200, 20)).toBe(10);
    expect(weeksToAffordReward(10, 0)).toBe(Infinity);
  });
});

describe("getRewardTier", () => {
  it("classifies reward tiers", () => {
    expect(getRewardTier(1)).toBe("impulse");
    expect(getRewardTier(4)).toBe("medium");
    expect(getRewardTier(8)).toBe("major");
    expect(getRewardTier(20)).toBe("epic");
  });
});

describe("projectEconomy", () => {
  it("projects all scenarios for rewards", () => {
    const projection = projectEconomy({
      missions: demoMissions,
      levels: demoLevels,
      achievements: [{ crystalReward: 20, isManual: false }],
      bosses: [{ crystalReward: 100 }],
      rewards: [
        { id: "1", title: "Helado", crystalCost: 10, maxPurchases: null },
        { id: "2", title: "Gran premio", crystalCost: 200, maxPurchases: 1 },
      ],
    });

    expect(projection.scenarios.normal.weeklyIncome.total).toBeGreaterThan(0);
    expect(projection.rewards).toHaveLength(2);
    expect(projection.rewards[1].maxPurchases).toBe(1);
    expect(projection.rewards[1].weeksToAfford.normal).toBeGreaterThan(
      projection.rewards[0].weeksToAfford.normal
    );
  });
});
