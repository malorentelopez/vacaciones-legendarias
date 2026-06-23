export interface LevelUpInfo {
  newLevel: number;
  crystalReward: number;
}

export interface BossVictoryInfo {
  title: string;
  xpReward: number;
  crystalReward: number;
}

export interface StreakFeedback {
  current: number;
  incremented: boolean;
  reset: boolean;
  milestone?: { days: 3 | 7; crystals: number };
}

export interface MorningComboFeedback {
  awarded: true;
  crystals: number;
}

export interface MissionCompleteFeedback {
  levelUp?: LevelUpInfo | null;
  streak?: StreakFeedback;
  morningCombo?: MorningComboFeedback;
}
