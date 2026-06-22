import { describe, it, expect } from "vitest";
import { calculateXpForNextLevel } from "../utils/period";

describe("calculateXpForNextLevel", () => {
  const levels = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 250 },
  ];

  it("calculates progress at level 1", () => {
    const result = calculateXpForNextLevel(1, 50, levels);
    expect(result.xpInLevel).toBe(50);
    expect(result.xpNeeded).toBe(100);
    expect(result.progress).toBe(50);
  });

  it("returns 100% at max level", () => {
    const result = calculateXpForNextLevel(3, 300, levels);
    expect(result.progress).toBe(100);
  });
});
