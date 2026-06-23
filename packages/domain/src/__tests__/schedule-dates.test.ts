import { describe, expect, it } from "vitest";
import { dateKeyToDbDate, dbDateToDateKey, toLocalDateKey } from "../utils/schedule";

describe("dateKeyToDbDate / dbDateToDateKey", () => {
  it("round-trips calendar keys through UTC date storage", () => {
    const key = "2026-06-23";
    expect(dbDateToDateKey(dateKeyToDbDate(key))).toBe(key);
  });

  it("maps a local calendar day to the same key used in the admin calendar", () => {
    const localDate = new Date(2026, 5, 23, 15, 30);
    const key = toLocalDateKey(localDate);
    expect(dbDateToDateKey(dateKeyToDbDate(key))).toBe(key);
  });
});
