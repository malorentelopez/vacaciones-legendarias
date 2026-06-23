import type { StreakFeedback } from "@repo/domain/client";
import type { PetReaction } from "@/components/pet-reaction-provider";

export function triggerMissionPetReactions(
  triggerReaction: (reaction: PetReaction) => void,
  feedback?: { streak?: StreakFeedback }
) {
  triggerReaction("jump");

  if (feedback?.streak?.incremented) {
    window.setTimeout(() => triggerReaction("fire"), 550);
  }
}
