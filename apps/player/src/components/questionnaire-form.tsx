"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge } from "@repo/ui";
import { submitQuestionnaire } from "@/actions/game";
import { useCelebrations } from "@/components/celebration-provider";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

interface QuestionnaireData {
  id: string;
  title: string;
  description: string | null;
  missionId: string;
  missionTitle: string;
  questions: Question[];
}

interface SubmitResult {
  correctCount: number;
  totalCount: number;
  passed: boolean;
  missionCompleted: boolean;
  levelUp?: { newLevel: number; crystalReward: number } | null;
  xpReward: number;
  crystalReward: number;
}

export function QuestionnaireForm({ questionnaire }: { questionnaire: QuestionnaireData }) {
  const router = useRouter();
  const { applyGameFeedback } = useCelebrations();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  function setAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      for (const question of questionnaire.questions) {
        if (!answers[question.id]) {
          throw new Error("Debes responder todas las preguntas");
        }
      }

      const response = await submitQuestionnaire(questionnaire.id, answers);
      setResult(response);
      applyGameFeedback({ levelUp: response.levelUp });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    }

    setLoading(false);
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Link
          href="/missions"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a misiones
        </Link>

        <Card className={`p-8 text-center ${result.passed ? "border-emerald-500/30" : "border-amber-500/30"}`}>
          {result.passed ? (
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
          ) : (
            <XCircle className="mx-auto mb-4 h-16 w-16 text-amber-400" />
          )}
          <h1 className="theme-page-title">
            {result.passed ? "¡Cuestionario aprobado!" : "Sigue intentándolo"}
          </h1>
          <p className="mt-2 text-slate-400">
            Has acertado {result.correctCount} de {result.totalCount} preguntas.
          </p>
          {result.passed && result.missionCompleted && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {result.xpReward > 0 && <Badge variant="info">+{result.xpReward} XP</Badge>}
              {result.crystalReward > 0 && (
                <Badge variant="warning">+{result.crystalReward} 💎</Badge>
              )}
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {!result.passed && (
              <Button onClick={() => setResult(null)}>Reintentar</Button>
            )}
            <Link href="/missions">
              <Button variant={result.passed ? "default" : "outline"} className="w-full sm:w-auto">
                {result.passed ? "Continuar" : "Volver"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
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

      <header>
        <p className="text-sm text-slate-500">{questionnaire.missionTitle}</p>
        <h1 className="theme-page-title">{questionnaire.title}</h1>
        {questionnaire.description && (
          <p className="mt-1 text-slate-400">{questionnaire.description}</p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        {questionnaire.questions.map((question, index) => (
          <Card key={question.id} className="p-4">
            <p className="mb-3 font-medium text-white">
              {index + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    answers[question.id] === option.id
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => setAnswer(question.id, option.id)}
                    className="shrink-0"
                  />
                  <span className="text-sm text-slate-200">{option.text}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar respuestas"}
        </Button>
      </form>
    </div>
  );
}
