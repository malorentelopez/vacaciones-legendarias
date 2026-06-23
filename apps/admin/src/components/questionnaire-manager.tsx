"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button } from "@repo/ui";
import { createQuestionnaire, deleteQuestionnaire } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, FileJson, FormInput } from "lucide-react";
import {
  parseQuestionnaireJson,
  parsedToQuestionForms,
  QUESTIONNAIRE_JSON_EXAMPLE,
} from "@repo/domain/client";

type CreateMode = "manual" | "json";

interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionForm {
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
}

interface QuestionnaireData {
  mission: {
    id: string;
    title: string;
    type: string;
    frequency: string;
    xpReward: number;
    crystalReward: number;
  };
  questionnaires: {
    id: string;
    title: string;
    description: string | null;
    order: number;
    questions: { id: string; text: string }[];
    submissions: {
      characterId: string;
      passed: boolean;
      correctCount: number;
      totalCount: number;
      character: { id: string; name: string };
    }[];
  }[];
  characters: { id: string; name: string }[];
  canCreateNext: boolean;
  latestQuestionnaireId: string | null;
}

function newOption(): QuestionOption {
  return { id: crypto.randomUUID(), text: "" };
}

function emptyQuestion(): QuestionForm {
  const a = newOption();
  const b = newOption();
  return { text: "", options: [a, b], correctOptionId: a.id };
}

export function QuestionnaireManager({ initial }: { initial: QuestionnaireData }) {
  const [data, setData] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createMode, setCreateMode] = useState<CreateMode>("manual");
  const [jsonInput, setJsonInput] = useState(QUESTIONNAIRE_JSON_EXAMPLE);

  function openCreate() {
    setFormTitle("");
    setFormDescription("");
    setQuestions([emptyQuestion()]);
    setCreateMode("manual");
    setJsonInput(QUESTIONNAIRE_JSON_EXAMPLE);
    setError("");
    setModalOpen(true);
  }

  function updateQuestion(index: number, patch: Partial<QuestionForm>) {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, text: string) {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) => (j === oIndex ? { ...o, text } : o)),
            }
          : q
      )
    );
  }

  function addQuestion() {
    setQuestions([...questions, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function addOption(qIndex: number) {
    const q = questions[qIndex];
    if (!q || q.options.length >= 6) return;
    setQuestions(
      questions.map((item, i) =>
        i === qIndex ? { ...item, options: [...item.options, newOption()] } : item
      )
    );
  }

  function removeOption(qIndex: number, oIndex: number) {
    const q = questions[qIndex];
    if (!q || q.options.length <= 2) return;
    const removed = q.options[oIndex];
    const newOptions = q.options.filter((_, i) => i !== oIndex);
    setQuestions(
      questions.map((item, i) =>
        i === qIndex
          ? {
              ...item,
              options: newOptions,
              correctOptionId:
                item.correctOptionId === removed?.id
                  ? (newOptions[0]?.id ?? "")
                  : item.correctOptionId,
            }
          : item
      )
    );
  }

  async function submitPayload(payload: {
    title: string;
    description?: string;
    questions: {
      text: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
    }[];
  }) {
    if (!payload.title) throw new Error("El título es obligatorio");
    for (const q of payload.questions) {
      if (!q.text) throw new Error("Todas las preguntas deben tener enunciado");
      if (q.options.some((o) => !o.text)) throw new Error("Todas las opciones deben tener texto");
    }

    const created = await createQuestionnaire(data.mission.id, payload);
    setData({
      ...data,
      questionnaires: [...data.questionnaires, { ...created, submissions: [] }],
      canCreateNext: false,
      latestQuestionnaireId: created.id,
    });
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await submitPayload({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        questions: questions.map((q) => ({
          text: q.text.trim(),
          options: q.options.map((o) => ({ id: o.id, text: o.text.trim() })),
          correctOptionId: q.correctOptionId,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuestionario");
    }

    setLoading(false);
  }

  function handleImportJsonToForm() {
    setError("");
    try {
      const parsed = parseQuestionnaireJson(jsonInput);
      const forms = parsedToQuestionForms(parsed);
      setFormTitle(forms.title);
      setFormDescription(forms.description);
      setQuestions(forms.questions);
      setCreateMode("manual");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar JSON");
    }
  }

  async function handleJsonSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const parsed = parseQuestionnaireJson(jsonInput);
      await submitPayload(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuestionario");
    }

    setLoading(false);
  }

  async function handleDelete(questionnaireId: string) {
    if (!confirm("¿Eliminar este cuestionario?")) return;
    try {
      await deleteQuestionnaire(questionnaireId, data.mission.id);
      const remaining = data.questionnaires.filter((q) => q.id !== questionnaireId);
      const latest = remaining[remaining.length - 1] ?? null;
      const canCreateNext =
        !latest ||
        data.characters.every((c) => characterPassed(latest.id, c.id));
      setData({
        ...data,
        questionnaires: remaining,
        latestQuestionnaireId: latest?.id ?? null,
        canCreateNext,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  function characterPassed(questionnaireId: string, characterId: string) {
    const q = data.questionnaires.find((item) => item.id === questionnaireId);
    return q?.submissions.some((s) => s.characterId === characterId && s.passed) ?? false;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/missions"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a misiones
      </Link>

      <PageHeader
        title={`Cuestionarios: ${data.mission.title}`}
        description="Crea cuestionarios secuenciales. La jugadora solo verá el último disponible que aún no haya aprobado."
        actionLabel={data.canCreateNext ? "Nuevo cuestionario" : undefined}
        onAction={data.canCreateNext ? openCreate : undefined}
      />

      {!data.canCreateNext && data.latestQuestionnaireId && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Todos los personajes deben aprobar el cuestionario actual antes de crear uno nuevo.
        </Card>
      )}

      {data.questionnaires.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <p>Aún no hay cuestionarios para esta misión.</p>
          {data.canCreateNext && (
            <Button className="mt-4" onClick={openCreate}>
              Crear el primero
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {data.questionnaires.map((q, index) => (
            <Card key={q.id} className="overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">#{index + 1}</Badge>
                    <h3 className="font-bold">{q.title}</h3>
                  </div>
                  {q.description && (
                    <p className="mt-1 text-sm text-slate-400">{q.description}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {q.questions.length} pregunta{q.questions.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {!q.submissions.some((s) => s.passed) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Estado por personaje
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.characters.map((c) => {
                    const passed = characterPassed(q.id, c.id);
                    const submission = q.submissions.find((s) => s.characterId === c.id);
                    return (
                      <span
                        key={c.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                          passed
                            ? "bg-emerald-500/20 text-emerald-300"
                            : submission
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                        {c.name}
                        {submission && !passed && (
                          <span className="opacity-75">
                            ({submission.correctCount}/{submission.totalCount})
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo cuestionario"
        description="Opción única por pregunta. Se corrige automáticamente al enviar."
        size="lg"
      >
        <div className="mb-4 flex gap-2 rounded-xl bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => setCreateMode("manual")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              createMode === "manual"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FormInput className="h-4 w-4" />
            Formulario
          </button>
          <button
            type="button"
            onClick={() => setCreateMode("json")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              createMode === "json"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileJson className="h-4 w-4" />
            Importar JSON
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        {createMode === "json" ? (
          <form onSubmit={handleJsonSubmit} className="space-y-4">
            <Card className="space-y-3 border-slate-700 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-200">Ejemplo de estructura</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setJsonInput(QUESTIONNAIRE_JSON_EXAMPLE)}
                >
                  Usar ejemplo
                </Button>
              </div>
              <pre className="max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-300">
                {QUESTIONNAIRE_JSON_EXAMPLE}
              </pre>
              <ul className="list-inside list-disc space-y-1 text-xs text-slate-500">
                <li><code className="text-slate-400">title</code> y <code className="text-slate-400">questions</code> son obligatorios.</li>
                <li><code className="text-slate-400">options</code> puede ser un array de textos o de objetos <code className="text-slate-400">{`{ "id", "text" }`}</code>.</li>
                <li>Marca la correcta con <code className="text-slate-400">correct</code> (índice, empieza en 0) o <code className="text-slate-400">correctOptionId</code>.</li>
                <li>Cada pregunta necesita entre 2 y 6 opciones.</li>
              </ul>
            </Card>

            <FormField label="JSON del cuestionario" htmlFor="q-json" required>
              <textarea
                id="q-json"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className={`${textareaClass} min-h-[220px] font-mono text-sm`}
                spellCheck={false}
                required
              />
            </FormField>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleImportJsonToForm}
              >
                Cargar en formulario
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Guardando..." : "Crear desde JSON"}
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Título" htmlFor="q-title" required>
            <input
              id="q-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className={inputClass}
              placeholder="Ej: Repaso de multiplicaciones"
              required
            />
          </FormField>

          <FormField label="Descripción" htmlFor="q-desc">
            <textarea
              id="q-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className={textareaClass}
              rows={2}
            />
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">Preguntas</h4>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="mr-1 h-4 w-4" />
                Añadir
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <FormField label={`Pregunta ${qIndex + 1}`} htmlFor={`q-text-${qIndex}`} required>
                    <input
                      id={`q-text-${qIndex}`}
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                      className={inputClass}
                      placeholder="Enunciado de la pregunta"
                      required
                    />
                  </FormField>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="mt-6 rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Opciones (marca la correcta)</p>
                  {question.options.map((option, oIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctOptionId === option.id}
                        onChange={() => updateQuestion(qIndex, { correctOptionId: option.id })}
                        className="shrink-0"
                      />
                      <input
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className={inputClass}
                        placeholder={`Opción ${oIndex + 1}`}
                        required
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="shrink-0 rounded p-1.5 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {question.options.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(qIndex)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Opción
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : "Crear cuestionario"}
            </Button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
}
