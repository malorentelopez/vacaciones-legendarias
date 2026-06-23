"use client";

import { useState } from "react";
import { Card, Badge, Button, CharacterPortrait } from "@repo/ui";
import { applyPenalty, resetWeeklyPoints } from "@/actions/admin";
import {
  getTheme,
  getRoleName,
  getRoleImage,
  normalizeRoleKey,
} from "@repo/domain/client";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { AlertTriangle, Clock, RotateCcw, Star, Zap } from "lucide-react";

interface Character {
  id: string;
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
  level: number;
  weeklyPoints: number;
  screenTimeMinutes: number;
}

interface PenaltyRecord {
  id: string;
  points: number;
  reason: string | null;
  appliedAt: Date;
  character: Character;
}

function CharacterAvatar({ character, size = "md" }: { character: Character; size?: "sm" | "md" | "lg" }) {
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(character.themeKey);
  const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);

  return (
    <CharacterPortrait
      imageSrc={getRoleImage(character.themeKey, genderKey, roleKey)}
      alt={getRoleName(character.themeKey, genderKey, roleKey)}
      primaryColor={theme.colors.primary}
      secondaryColor={theme.colors.secondary}
      size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
    />
  );
}

function formatPenaltyDate(date: Date) {
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PenaltiesManager({
  characters: initialCharacters,
  initialPenalties,
}: {
  characters: Character[];
  initialPenalties: PenaltyRecord[];
}) {
  const [characters, setCharacters] = useState(initialCharacters);
  const [penalties, setPenalties] = useState(initialPenalties);
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(initialCharacters[0]?.id ?? "");
  const [points, setPoints] = useState(5);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const maxPoints = Math.max(...characters.map((c) => c.weeklyPoints), 1);

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
    try {
      const penalty = await applyPenalty(selectedId, points, reason || undefined);
      const character = characters.find((c) => c.id === selectedId);
      const enrichedPenalty: PenaltyRecord = {
        ...penalty,
        character: {
          ...penalty.character,
          weeklyPoints: penalty.character.weeklyPoints,
          screenTimeMinutes: character?.screenTimeMinutes ?? 30,
        },
      };
      setCharacters(
        characters.map((c) =>
          c.id === selectedId ? { ...c, weeklyPoints: penalty.character.weeklyPoints } : c
        )
      );
      setPenalties([enrichedPenalty, ...penalties]);
      setPenaltyModalOpen(false);
      setReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al aplicar penalización");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await resetWeeklyPoints();
      setCharacters(characters.map((c) => ({ ...c, weeklyPoints: 0 })));
      setResetModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al resetear");
    } finally {
      setLoading(false);
    }
  }

  const selectedCharacter = characters.find((c) => c.id === selectedId);

  return (
    <div className="space-y-8">
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
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Jugadores</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {characters.map((c) => {
              const progress = (c.weeklyPoints / maxPoints) * 100;
              const weekPenalties = penalties
                .filter((p) => p.character.id === c.id)
                .reduce((sum, p) => sum + p.points, 0);

              return (
                <Card key={c.id} className="overflow-hidden">
                  <div
                    className="h-1 bg-gradient-to-r from-emerald-500 to-amber-500"
                    style={{ width: `${Math.max(8, progress)}%` }}
                  />
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <CharacterAvatar character={c} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-white">{c.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge variant="info">
                            <Star className="mr-1 inline h-3 w-3" />
                            Nivel {c.level}
                          </Badge>
                          <Badge variant="default">
                            <Zap className="mr-1 inline h-3 w-3" />
                            {c.weeklyPoints} pts
                          </Badge>
                          <Badge variant="success">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {c.screenTimeMinutes} min pantalla
                          </Badge>
                        </div>
                        {weekPenalties > 0 && (
                          <p className="mt-2 text-xs text-red-400">
                            −{weekPenalties} pts penalizados en el historial reciente
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => openPenalty(c.id)}
                    >
                      Aplicar penalización
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Historial de penalizaciones
        </h2>
        {penalties.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-40" />
            Aún no hay penalizaciones registradas.
          </Card>
        ) : (
          <Card className="divide-y divide-slate-800 overflow-hidden">
            {penalties.map((p) => (
              <div key={p.id} className="flex items-start gap-4 p-4">
                <CharacterAvatar character={p.character} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{p.character.name}</span>
                    <Badge variant="warning">−{p.points} pts</Badge>
                    <span className="text-xs text-slate-500">{formatPenaltyDate(p.appliedAt)}</span>
                  </div>
                  {p.reason ? (
                    <p className="mt-1 text-sm text-slate-400">{p.reason}</p>
                  ) : (
                    <p className="mt-1 text-sm italic text-slate-600">Sin motivo indicado</p>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>

      <Modal
        open={penaltyModalOpen}
        onClose={() => setPenaltyModalOpen(false)}
        title="Aplicar penalización"
        description="Resta puntos semanales al jugador seleccionado."
      >
        {selectedCharacter && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
            <CharacterAvatar character={selectedCharacter} size="md" />
            <div>
              <p className="font-medium text-white">{selectedCharacter.name}</p>
              <p className="text-sm text-slate-400">{selectedCharacter.weeklyPoints} pts esta semana</p>
            </div>
          </div>
        )}

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
