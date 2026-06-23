import { describe, it, expect } from "vitest";
import { parseQuestionnaireJson, QUESTIONNAIRE_JSON_EXAMPLE } from "../utils/questionnaire-import";

describe("parseQuestionnaireJson", () => {
  it("parses the documented example", () => {
    const result = parseQuestionnaireJson(QUESTIONNAIRE_JSON_EXAMPLE);

    expect(result.title).toBe("Tabla del 7");
    expect(result.description).toBe("Repaso rápido de multiplicaciones");
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]?.correctOptionId).toBe("opt-0");
    expect(result.questions[1]?.correctOptionId).toBe("b");
  });

  it("rejects invalid JSON", () => {
    expect(() => parseQuestionnaireJson("{ title: }")).toThrow("JSON inválido");
  });

  it("rejects missing correct answer", () => {
    expect(() =>
      parseQuestionnaireJson(
        JSON.stringify({
          title: "Test",
          questions: [{ text: "P?", options: ["A", "B"] }],
        })
      )
    ).toThrow("indica la respuesta correcta");
  });
});
