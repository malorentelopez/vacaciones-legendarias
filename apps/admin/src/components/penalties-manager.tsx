"use client";

import { useState } from "react";
import { Card, Button } from "@repo/ui";
import { applyPenalty, resetWeeklyPoints } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { AlertTriangle, RotateCcw, Zap } from "lucide-react";

interface Character {
  id: string;
  name: string;
  weeklyPoints: number;
}

export function PenaltiesManager({ characters: initial }: { characters: Character[] }) {
  const [characters, setCharacters] = useState(initial);
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(characters[0]?.id ?? "");
  const [points, setPoints] = useState(5);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  function openPenalty(characterId?: string) {
    if (characterId) setSelectedId(characterId);
    else if (!selectedId && characters[0]) setSelectedId(characters[0].id);
    setPoints(5);
    setReason("");
    setPenaltyModalOpen(true);
  }

  async function handlePenalty(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await applyPenalty(selectedId, points, reason || undefined);
    setCharacters(
      characters.map((c) =>
        c.id === selectedId
          ? { ...c, weeklyPoints: Math.max(0, c.weeklyPoints - points) }
          : c
      )
    );
    setPenaltyModalOpen(false);
    setReason("");
    setLoading(false);
  }

  async function handleReset() {
    setLoading(true);
    await resetWeeklyPoints();
    setCharacters(characters.map((c) => ({ ...c, weeklyPoints: 0 })));
    setResetModalOpen(false);
    setLoading(false);
  }

  const maxPoints = Math.max(...characters.map((c) => c.weeklyPoints), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penalizaciones"
        description="Resta puntos semanales cuando haga falta. El reset semanal reinicia el contador de todos."
        actionLabel="Aplicar penalización"
        onAction={() => openPenalty()}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setResetModalOpen(true)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset semanal
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          Crea personajes primero para gestionar penalizaciones.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => {
            const progress = (c.weeklyPoints / maxPoints) * 100;
            return (
              <button key={c.id} type="button" onClick={() => openPenalty(c.id)} className="text-left">
                <Card className="overflow-hidden transition-all hover:border-red-500/30">
                  <div
                    className="h-1 bg-gradient-to-r from-emerald-500 to-amber-500"
                    style={{ width: `${Math.max(10, progress)}%` }}
                  />
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xl">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{c.name}</h3>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-sm text-slate-400">{c.weeklyPoints} pts esta semana</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* Penalty modal */}
      <Modal
        open={penaltyModalOpen}
        onClose={() => setPenaltyModalOpen(false)}
        title="Aplicar penalización"
        description="Resta puntos semanales al jugador seleccionado."
      >
        <form onSubmit={handlePenalty} className="space-y-4">
          <FormField label="Jugador" htmlFor="penalty-char" required>
            <select
              id="penalty-char"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={selectClass}
              required
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.weeklyPoints} pts actuales)
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Puntos a restar" htmlFor="penalty-points" required>
            <input
              id="penalty-points"
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className={inputClass}
              required
            />
          </FormField>

          <FormField label="Motivo" htmlFor="penalty-reason" hint="Opcional. Ayuda a recordar por qué se aplicó.">
            <textarea
              id="penalty-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={textareaClass}
              rows={2}
              placeholder="Ej: No hizo la cama esta mañana"
            />
          </FormField>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setPenaltyModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" className="flex-1" disabled={loading}>
              {loading ? "Aplicando..." : "Aplicar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset confirmation modal */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset semanal"
        description="Reinicia los puntos semanales de todos los jugadores."
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <p className="text-sm text-slate-300">
              Esta acción pone a <strong>0</strong> los puntos semanales de toda la familia.
              Úsalo al empezar una nueva semana.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setResetModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" disabled={loading} onClick={handleReset}>
              {loading ? "Reseteando..." : "Confirmar reset"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
