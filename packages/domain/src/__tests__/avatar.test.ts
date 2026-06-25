import { describe, it, expect } from "vitest";
import { parseAvatarConfig, stripProgressFromAvatarConfig } from "../utils/avatar";

describe("stripProgressFromAvatarConfig", () => {
  it("keeps appearance and removes progress fields", () => {
    const config = {
      useCustom: true,
      customImage: "/avatars/test.png",
      equipped: { hat: "hat_star", pet: "pet_cat" },
      unlockedAccessories: ["hat_star"],
      secrets: { "dragon-chest": { completedAt: "2026-01-01" } },
      dialoguesSeen: { "morning-1": true },
      streak: { current: 5, lastActiveDate: "2026-06-24", best: 10 },
      combos: { morningBonusDate: "2026-06-24" },
    };

    const result = stripProgressFromAvatarConfig(config);

    expect(result).toEqual({
      useCustom: true,
      customImage: "/avatars/test.png",
      equipped: { hat: "hat_star", pet: "pet_cat" },
    });
    expect(parseAvatarConfig(result).streak).toBeUndefined();
    expect(parseAvatarConfig(result).secrets).toBeUndefined();
  });
});
