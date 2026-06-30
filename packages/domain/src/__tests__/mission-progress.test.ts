import { describe, it, expect } from "vitest";
import {
  characterMissionProgressKey,
  dedupeCharacterMissionProgressRefs,
  dedupeMissionProgressRefs,
  missionProgressKey,
} from "../utils/mission-progress";

describe("missionProgressKey", () => {
  it("combines mission id and period key", () => {
    expect(missionProgressKey("mission-1", "2026-06-30")).toBe("mission-1:2026-06-30");
  });
});

describe("dedupeMissionProgressRefs", () => {
  it("removes duplicate mission and period pairs", () => {
    const refs = dedupeMissionProgressRefs([
      { missionId: "a", periodKey: "daily" },
      { missionId: "a", periodKey: "daily" },
      { missionId: "b", periodKey: "weekly" },
    ]);

    expect(refs).toHaveLength(2);
    expect(refs).toEqual([
      { missionId: "a", periodKey: "daily" },
      { missionId: "b", periodKey: "weekly" },
    ]);
  });
});

describe("characterMissionProgressKey", () => {
  it("includes character id in the key", () => {
    expect(characterMissionProgressKey("char-1", "mission-1", "daily")).toBe(
      "char-1:mission-1:daily"
    );
  });
});

describe("dedupeCharacterMissionProgressRefs", () => {
  it("removes duplicate character mission pairs", () => {
    const refs = dedupeCharacterMissionProgressRefs([
      { characterId: "c1", missionId: "m1", periodKey: "daily" },
      { characterId: "c1", missionId: "m1", periodKey: "daily" },
      { characterId: "c2", missionId: "m1", periodKey: "daily" },
    ]);

    expect(refs).toHaveLength(2);
  });
});
