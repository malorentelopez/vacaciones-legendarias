import type { MorningComboFeedback, StreakFeedback } from "@repo/domain/client";
import type { FloatingRewardPayload } from "@/components/manga/floating-reward-fx";
import { getMissionSfx } from "@/lib/mission-icons";

interface MissionRewards {
  type?: string;
  xpReward: number;
  crystalReward: number;
}

export function buildMissionRewardPayload(
  mission: MissionRewards,
  themeKey: string,
  feedback?: {
    streak?: StreakFeedback;
    morningCombo?: MorningComboFeedback;
  }
): FloatingRewardPayload {
  let crystals = mission.crystalReward;
  const extraSfx: string[] = [];

  if (feedback?.streak?.incremented) {
    extraSfx.push(`¡RACHA! x${feedback.streak.current}`);
    if (feedback.streak.milestone) {
      crystals += feedback.streak.milestone.crystals;
    }
  }

  if (feedback?.morningCombo?.awarded) {
    extraSfx.push("¡COMBO MATINAL!");
    crystals += feedback.morningCombo.crystals;
  }

  return {
    sfx: getMissionSfx(mission.type, themeKey),
    xp: mission.xpReward,
    crystals,
    extraSfx: extraSfx.length > 0 ? extraSfx : undefined,
  };
}
