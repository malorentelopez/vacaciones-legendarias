export type ProgressScenario = "optimistic" | "normal" | "conservative";

export type ScenarioRates = {
  dailyCompletion: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  sideQuestCompletion: number;
  bossCompletion: number;
};

export const SCENARIO_RATES: Record<ProgressScenario, ScenarioRates> = {
  optimistic: {
    dailyCompletion: 0.9,
    weeklyCompletion: 1,
    monthlyCompletion: 1,
    sideQuestCompletion: 0.8,
    bossCompletion: 0.9,
  },
  normal: {
    dailyCompletion: 0.7,
    weeklyCompletion: 0.85,
    monthlyCompletion: 0.8,
    sideQuestCompletion: 0.5,
    bossCompletion: 0.75,
  },
  conservative: {
    dailyCompletion: 0.5,
    weeklyCompletion: 0.6,
    monthlyCompletion: 0.5,
    sideQuestCompletion: 0.3,
    bossCompletion: 0.5,
  },
};

export const TIER_THRESHOLDS = {
  impulse: 2,
  medium: 6,
  major: 12,
} as const;

export type RewardTier = "impulse" | "medium" | "major" | "epic";

export type MissionInput = {
  crystalReward: number;
  xpReward: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  isSideQuest: boolean;
};

export type WeeklyIncomeBreakdown = {
  missions: number;
  levels: number;
  achievements: number;
  boss: number;
  total: number;
};

export type RewardProjection = {
  id: string;
  title: string;
  crystalCost: number;
  maxPurchases: number | null;
  weeksToAfford: Record<ProgressScenario, number>;
  tier: RewardTier;
  monthlySharePercent: number;
  warnings: string[];
};

export type EconomyProjection = {
  scenarios: Record<
    ProgressScenario,
    {
      weeklyIncome: WeeklyIncomeBreakdown;
    }
  >;
  rewards: RewardProjection[];
  historical?: {
    avgWeeklyEarned: number;
    avgWeeklySpent: number;
    weeksOfData: number;
  };
};

const WEEKS_PER_MONTH = 30 / 7;
const ACHIEVEMENT_SPREAD_WEEKS = 8;
const MIN_WEEKS_FOR_LEVEL_AMORTIZATION = 4;

function completionRate(mission: MissionInput, rates: ScenarioRates): number {
  if (mission.isSideQuest) return rates.sideQuestCompletion;
  if (mission.frequency === "DAILY") return rates.dailyCompletion;
  if (mission.frequency === "WEEKLY") return rates.weeklyCompletion;
  return rates.monthlyCompletion;
}

export function calculateMissionWeeklyCrystals(
  missions: MissionInput[],
  rates: ScenarioRates
): number {
  let total = 0;

  for (const mission of missions) {
    if (mission.crystalReward <= 0) continue;

    const rate = completionRate(mission, rates);

    if (mission.frequency === "DAILY") {
      total += mission.crystalReward * 7 * rate;
    } else if (mission.frequency === "WEEKLY") {
      total += mission.crystalReward * rate;
    } else {
      total += (mission.crystalReward * rate) / WEEKS_PER_MONTH;
    }
  }

  return round(total);
}

export function calculateMissionWeeklyXp(missions: MissionInput[], rates: ScenarioRates): number {
  let total = 0;

  for (const mission of missions) {
    if (mission.xpReward <= 0) continue;

    const rate = completionRate(mission, rates);

    if (mission.frequency === "DAILY") {
      total += mission.xpReward * 7 * rate;
    } else if (mission.frequency === "WEEKLY") {
      total += mission.xpReward * rate;
    } else {
      total += (mission.xpReward * rate) / WEEKS_PER_MONTH;
    }
  }

  return round(total);
}

export function calculateLevelWeeklyCrystals(
  levels: { level: number; xpRequired: number; crystalReward: number }[],
  weeklyXp: number
): number {
  if (levels.length === 0 || weeklyXp <= 0) return 0;

  const sorted = [...levels].sort((a, b) => a.level - b.level);
  const maxLevel = sorted[sorted.length - 1];
  const totalCrystals = sorted
    .filter((level) => level.crystalReward > 0)
    .reduce((sum, level) => sum + level.crystalReward, 0);

  if (totalCrystals === 0 || maxLevel.xpRequired <= 0) return 0;

  const weeksToMax = Math.max(MIN_WEEKS_FOR_LEVEL_AMORTIZATION, maxLevel.xpRequired / weeklyXp);
  return round(totalCrystals / weeksToMax);
}

export function calculateAchievementWeeklyCrystals(
  achievements: { crystalReward: number; isManual: boolean }[]
): number {
  const total = achievements
    .filter((achievement) => !achievement.isManual && achievement.crystalReward > 0)
    .reduce((sum, achievement) => sum + achievement.crystalReward, 0);

  if (total === 0) return 0;
  return round(total / ACHIEVEMENT_SPREAD_WEEKS);
}

export function calculateBossWeeklyCrystals(
  bosses: { crystalReward: number }[],
  bossCompletion: number
): number {
  const monthlyTotal = bosses
    .filter((boss) => boss.crystalReward > 0)
    .reduce((sum, boss) => sum + boss.crystalReward, 0);

  if (monthlyTotal === 0) return 0;
  return round((monthlyTotal * bossCompletion) / WEEKS_PER_MONTH);
}

export function calculateWeeklyIncome(
  missions: MissionInput[],
  levels: { level: number; xpRequired: number; crystalReward: number }[],
  achievements: { crystalReward: number; isManual: boolean }[],
  bosses: { crystalReward: number }[],
  rates: ScenarioRates
): WeeklyIncomeBreakdown {
  const missionXp = calculateMissionWeeklyXp(missions, rates);
  const missionsIncome = calculateMissionWeeklyCrystals(missions, rates);
  const levelsIncome = calculateLevelWeeklyCrystals(levels, missionXp);
  const achievementsIncome = calculateAchievementWeeklyCrystals(achievements);
  const bossIncome = calculateBossWeeklyCrystals(bosses, rates.bossCompletion);

  return {
    missions: missionsIncome,
    levels: levelsIncome,
    achievements: achievementsIncome,
    boss: bossIncome,
    total: round(missionsIncome + levelsIncome + achievementsIncome + bossIncome),
  };
}

export function getRewardTier(weeksToAfford: number): RewardTier {
  if (weeksToAfford < TIER_THRESHOLDS.impulse) return "impulse";
  if (weeksToAfford < TIER_THRESHOLDS.medium) return "medium";
  if (weeksToAfford < TIER_THRESHOLDS.major) return "major";
  return "epic";
}

export function weeksToAffordReward(
  crystalCost: number,
  weeklyIncome: number
): number {
  if (crystalCost <= 0) return 0;
  if (weeklyIncome <= 0) return Infinity;
  return round(crystalCost / weeklyIncome, 1);
}

export function buildRewardWarnings(
  crystalCost: number,
  weeksNormal: number,
  maxPurchases: number | null
): string[] {
  const warnings: string[] = [];

  if (maxPurchases === 1 && weeksNormal < 4) {
    warnings.push("Muy barata para una recompensa de compra única");
  }

  if (maxPurchases === 1 && weeksNormal < 2) {
    warnings.push("Se alcanzaría en menos de 2 semanas con progreso normal");
  }

  if (weeksNormal > 16) {
    warnings.push("Puede resultar demasiado difícil de alcanzar");
  }

  if (crystalCost > 0 && weeksNormal < 0.5) {
    warnings.push("Demasiado barata respecto al ingreso semanal");
  }

  return warnings;
}

export function projectEconomy(input: {
  missions: MissionInput[];
  levels: { level: number; xpRequired: number; crystalReward: number }[];
  achievements: { crystalReward: number; isManual: boolean }[];
  bosses: { crystalReward: number }[];
  rewards: { id: string; title: string; crystalCost: number; maxPurchases: number | null }[];
  historical?: { avgWeeklyEarned: number; avgWeeklySpent: number; weeksOfData: number };
}): EconomyProjection {
  const scenarios = {} as EconomyProjection["scenarios"];

  for (const scenario of Object.keys(SCENARIO_RATES) as ProgressScenario[]) {
    const rates = SCENARIO_RATES[scenario];
    scenarios[scenario] = {
      weeklyIncome: calculateWeeklyIncome(
        input.missions,
        input.levels,
        input.achievements,
        input.bosses,
        rates
      ),
    };
  }

  const normalWeekly = scenarios.normal.weeklyIncome.total;

  const rewards: RewardProjection[] = input.rewards.map((reward) => {
    const weeksToAfford = {} as Record<ProgressScenario, number>;

    for (const scenario of Object.keys(SCENARIO_RATES) as ProgressScenario[]) {
      weeksToAfford[scenario] = weeksToAffordReward(
        reward.crystalCost,
        scenarios[scenario].weeklyIncome.total
      );
    }

    const tier = getRewardTier(weeksToAfford.normal);
    const monthlySharePercent =
      normalWeekly > 0
        ? round((reward.crystalCost / (normalWeekly * WEEKS_PER_MONTH)) * 100, 1)
        : 0;

    return {
      id: reward.id,
      title: reward.title,
      crystalCost: reward.crystalCost,
      maxPurchases: reward.maxPurchases,
      weeksToAfford,
      tier,
      monthlySharePercent,
      warnings: buildRewardWarnings(
        reward.crystalCost,
        weeksToAfford.normal,
        reward.maxPurchases
      ),
    };
  });

  return {
    scenarios,
    rewards,
    historical: input.historical,
  };
}

export function formatWeeksLabel(weeks: number): string {
  if (!Number.isFinite(weeks)) return "—";
  if (weeks < 1) return "< 1 semana";
  if (weeks === 1) return "1 semana";
  if (weeks < 8) return `${weeks} semanas`;
  const months = round(weeks / WEEKS_PER_MONTH, 1);
  return months === 1 ? "~1 mes" : `~${months} meses`;
}

export const TIER_LABELS: Record<RewardTier, string> = {
  impulse: "Impulso",
  medium: "Meta media",
  major: "Gran premio",
  epic: "Épico",
};

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
