import { describe, it, expect } from "vitest";
import { gradeAnswers } from "../utils/questionnaire";

const questions = [
  { id: "q1", correctOptionId: "a" },
  { id: "q2", correctOptionId: "b" },
  { id: "q3", correctOptionId: "c" },
];

describe("gradeAnswers", () => {
  it("passes when all answers are correct", () => {
    const result = gradeAnswers(questions, {
      q1: "a",
      q2: "b",
      q3: "c",
    });

    expect(result.correctCount).toBe(3);
    expect(result.totalCount).toBe(3);
    expect(result.passed).toBe(true);
  });

  it("fails when any answer is incorrect", () => {
    const result = gradeAnswers(questions, {
      q1: "a",
      q2: "wrong",
      q3: "c",
    });

    expect(result.correctCount).toBe(2);
    expect(result.totalCount).toBe(3);
    expect(result.passed).toBe(false);
  });

  it("fails when a question is unanswered", () => {
    const result = gradeAnswers(questions, {
      q1: "a",
      q2: "b",
    });

    expect(result.correctCount).toBe(2);
    expect(result.passed).toBe(false);
  });

  it("fails with invalid option ids", () => {
    const result = gradeAnswers(questions, {
      q1: "invalid",
      q2: "b",
      q3: "c",
    });

    expect(result.correctCount).toBe(2);
    expect(result.passed).toBe(false);
  });

  it("fails when there are no questions", () => {
    const result = gradeAnswers([], {});

    expect(result.correctCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.passed).toBe(false);
  });
});
