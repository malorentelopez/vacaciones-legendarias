export interface ParsedQuestionnaire {
  title: string;
  description?: string;
  questions: {
    text: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
  }[];
}

export const QUESTIONNAIRE_JSON_EXAMPLE = `{
  "title": "Tabla del 7",
  "description": "Repaso rápido de multiplicaciones",
  "questions": [
    {
      "text": "¿Cuánto es 7 × 3?",
      "options": ["21", "24", "28"],
      "correct": 0
    },
    {
      "text": "¿Cuánto es 7 × 8?",
      "options": [
        { "id": "a", "text": "54" },
        { "id": "b", "text": "56" },
        { "id": "c", "text": "63" }
      ],
      "correctOptionId": "b"
    }
  ]
}`;

type JsonOption = string | { id?: string; text: string };

interface JsonQuestion {
  text?: string;
  options?: JsonOption[];
  correct?: number;
  correctOptionId?: string;
}

interface JsonQuestionnaire {
  title?: string;
  description?: string;
  questions?: JsonQuestion[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptions(
  rawOptions: JsonOption[],
  questionIndex: number
): { id: string; text: string }[] {
  if (rawOptions.length < 2) {
    throw new Error(`Pregunta ${questionIndex + 1}: debe tener al menos 2 opciones`);
  }
  if (rawOptions.length > 6) {
    throw new Error(`Pregunta ${questionIndex + 1}: máximo 6 opciones`);
  }

  return rawOptions.map((option, optionIndex) => {
    if (typeof option === "string") {
      const text = option.trim();
      if (!text) {
        throw new Error(`Pregunta ${questionIndex + 1}, opción ${optionIndex + 1}: texto vacío`);
      }
      return { id: `opt-${optionIndex}`, text };
    }

    if (!isRecord(option) || typeof option.text !== "string") {
      throw new Error(`Pregunta ${questionIndex + 1}, opción ${optionIndex + 1}: formato inválido`);
    }

    const text = option.text.trim();
    if (!text) {
      throw new Error(`Pregunta ${questionIndex + 1}, opción ${optionIndex + 1}: texto vacío`);
    }

    const id = typeof option.id === "string" && option.id.trim() ? option.id.trim() : `opt-${optionIndex}`;
    return { id, text };
  });
}

function resolveCorrectOptionId(
  question: JsonQuestion,
  options: { id: string; text: string }[],
  questionIndex: number
): string {
  const hasCorrectIndex = typeof question.correct === "number";
  const hasCorrectId = typeof question.correctOptionId === "string" && question.correctOptionId.trim();

  if (hasCorrectIndex && hasCorrectId) {
    throw new Error(
      `Pregunta ${questionIndex + 1}: usa solo "correct" o "correctOptionId", no ambos`
    );
  }

  if (hasCorrectIndex) {
    const index = question.correct as number;
    if (!Number.isInteger(index) || index < 0 || index >= options.length) {
      throw new Error(
        `Pregunta ${questionIndex + 1}: "correct" debe ser un índice entre 0 y ${options.length - 1}`
      );
    }
    const match = options[index];
    if (!match) {
      throw new Error(`Pregunta ${questionIndex + 1}: índice de respuesta correcta inválido`);
    }
    return match.id;
  }

  if (hasCorrectId) {
    const correctOptionId = question.correctOptionId!.trim();
    if (!options.some((o) => o.id === correctOptionId)) {
      throw new Error(
        `Pregunta ${questionIndex + 1}: "correctOptionId" no coincide con ninguna opción`
      );
    }
    return correctOptionId;
  }

  throw new Error(
    `Pregunta ${questionIndex + 1}: indica la respuesta correcta con "correct" (índice) o "correctOptionId"`
  );
}

export function parseQuestionnaireJson(raw: string): ParsedQuestionnaire {
  let data: unknown;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("JSON inválido. Revisa comas, comillas y llaves.");
  }

  if (!isRecord(data)) {
    throw new Error("El JSON debe ser un objeto con title y questions");
  }

  const questionnaire = data as JsonQuestionnaire;

  const title = typeof questionnaire.title === "string" ? questionnaire.title.trim() : "";
  if (!title) {
    throw new Error('El campo "title" es obligatorio');
  }

  const description =
    typeof questionnaire.description === "string" && questionnaire.description.trim()
      ? questionnaire.description.trim()
      : undefined;

  if (!Array.isArray(questionnaire.questions) || questionnaire.questions.length === 0) {
    throw new Error('El campo "questions" debe ser un array con al menos una pregunta');
  }

  const questions = questionnaire.questions.map((question, index) => {
    if (!isRecord(question)) {
      throw new Error(`Pregunta ${index + 1}: formato inválido`);
    }

    const text = typeof question.text === "string" ? question.text.trim() : "";
    if (!text) {
      throw new Error(`Pregunta ${index + 1}: el campo "text" es obligatorio`);
    }

    if (!Array.isArray(question.options)) {
      throw new Error(`Pregunta ${index + 1}: el campo "options" debe ser un array`);
    }

    const options = parseOptions(question.options, index);
    const correctOptionId = resolveCorrectOptionId(question, options, index);

    return { text, options, correctOptionId };
  });

  return { title, description, questions };
}

export function parsedToQuestionForms(parsed: ParsedQuestionnaire) {
  return {
    title: parsed.title,
    description: parsed.description ?? "",
    questions: parsed.questions.map((q) => ({
      text: q.text,
      options: q.options.map((o) => ({ ...o })),
      correctOptionId: q.correctOptionId,
    })),
  };
}
