"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createAchievement, updateAchievement, deleteAchievement, grantAchievement } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Trophy, Target, Star, Repeat, UserCheck } from "lucide-react";

interface Mission {
  id: string;
  title: string;
}

interface AchievementMission {
  missionId: string;
  mission: { id: string; title: string };
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  requiredLevel: number | null;
  requiredMissions: number | null;
  targetMissionId: string | null;
  targetMissionCompletions: number | null;
  crystalReward: number;
  familyId: string | null;
  isManual: boolean;
  missions: AchievementMission[];
  targetMission?: { id: string; title: string } | null;
}

interface Character {
  id: string;
  name: string;
}

interface AchievementUnlock {
  achievementId: string;
  characterId: string;
  character: { id: string; name: string };
}

type AchievementType = "missions" | "level" | "mission_count" | "manual";

const emptyForm = {
  title: "",
  description: "",
  crystalReward: 10,
  requiredLevel: 3,
  selectedMissionIds: [] as string[],
  targetMissionId: "",
  targetMissionCompletions: 5,
};

export function AchievementsManager({
  achievements: initial,
  missions,
  characters,
  unlocks: initialUnlocks,
  familyId,
}: {
  achievements: Achievement[];
  missions: Mission[];
  characters: Character[];
  unlocks: AchievementUnlock[];
  familyId: string;
}) {
  const [achievements, setAchievements] = useState(initial);
  const [unlocks, setUnlocks] = useState(initialUnlocks);
  const [modalOpen, setModalOpen] = useState(false);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantingAchievement, setGrantingAchievement] = useState<Achievement | null>(null);
  const [grantCharacterId, setGrantCharacterId] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [achievementType, setAchievementType] = useState<AchievementType>("missions");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setAchievementType("missions");
    setError("");
    setModalOpen(true);
  }

  function openEdit(a: Achievement) {
    const type = getAchievementType(a);
    setEditingId(a.id);
    setAchievementType(type);
    setForm({
      title: a.title,
      description: a.description ?? "",
      crystalReward: a.crystalReward,
      requiredLevel: a.requiredLevel ?? 3,
      selectedMissionIds: a.missions.map((m) => m.missionId),
      targetMissionId: a.targetMissionId ?? a.targetMission?.id ?? "",
      targetMissionCompletions: a.targetMissionCompletions ?? 5,
    });
    setError("");
    setModalOpen(true);
  }

  function toggleMission(missionId: string) {
    setForm((f) => ({
      ...f,
      selectedMissionIds: f.selectedMissionIds.includes(missionId)
        ? f.selectedMissionIds.filter((id) => id !== missionId)
        : [...f.selectedMissionIds, missionId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (achievementType === "missions" && form.selectedMissionIds.length === 0) {
      setError("Selecciona al menos una misión");
      return;
    }
    if (achievementType === "mission_count") {
      if (!form.targetMissionId) {
        setError("Selecciona una misión");
        return;
      }
      if (form.targetMissionCompletions < 1) {
        setError("El número de veces debe ser al menos 1");
        return;
      }
    }

    setLoading(true);
    try {
      const payload =
        achievementType === "manual"
          ? {
              title: form.title,
              description: form.description || undefined,
              crystalReward: form.crystalReward,
              isManual: true,
            }
          : {
              title: form.title,
              description: form.description || undefined,
              crystalReward: form.crystalReward,
              ...(achievementType === "missions"
                ? { missionIds: form.selectedMissionIds }
                : achievementType === "level"
                  ? { requiredLevel: form.requiredLevel }
                  : {
                      targetMissionId: form.targetMissionId,
                      targetMissionCompletions: form.targetMissionCompletions,
                    }),
            };

      if (editingId) {
        const updated = await updateAchievement(editingId, payload);
        setAchievements(achievements.map((a) => (a.id === editingId ? (updated as Achievement) : a)));
      } else {
        const created = await createAchievement(payload);
        setAchievements([...achievements, created as Achievement]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este logro? Los jugadores que ya lo desbloquearon perderán el registro.")) return;
    try {
      await deleteAchievement(id);
      setAchievements(achievements.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  function getAchievementType(a: Achievement): AchievementType {
    if (a.isManual) return "manual";
    if (a.requiredLevel) return "level";
    if (a.targetMissionId) return "mission_count";
    return "missions";
  }

  function getUnlocksForAchievement(achievementId: string) {
    return unlocks.filter((u) => u.achievementId === achievementId);
  }

  function openGrant(a: Achievement) {
    setGrantingAchievement(a);
    setGrantCharacterId("");
    setGrantModalOpen(true);
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!grantingAchievement || !grantCharacterId) return;

    setGrantLoading(true);
    try {
      await grantAchievement(grantCharacterId, grantingAchievement.id);
      const character = characters.find((c) => c.id === grantCharacterId);
      if (character) {
        setUnlocks([
          {
            achievementId: grantingAchievement.id,
            characterId: grantCharacterId,
            character: { id: character.id, name: character.name },
          },
          ...unlocks,
        ]);
      }
      setGrantModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al otorgar");
    } finally {
      setGrantLoading(false);
    }
  }

  function canManage(a: Achievement) {
    return a.familyId === familyId;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logros"
        description="Insignias automáticas por misiones o nivel, y logros manuales que otorgas tras verificar algo en la vida real."
        actionLabel="Nuevo logro"
        onAction={openCreate}
      />

      {achievements.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400/50" />
          Crea el primer logro para motivar a los jugadores.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => {
            const type = getAchievementType(a);
            const achievementUnlocks = getUnlocksForAchievement(a.id);
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                    <Trophy className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{a.title}</h3>
                      {canManage(a) && (
                        <ActionButtons
                          onEdit={() => openEdit(a)}
                          onDelete={() => handleDelete(a.id)}
                        />
                      )}
                    </div>
                    {a.description && (
                      <p className="mt-0.5 text-sm text-slate-400">{a.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="warning">+{a.crystalReward} 💎</Badge>
                      {type === "manual" && (
                        <Badge variant="info">
                          <UserCheck className="mr-1 inline h-3 w-3" />
                          Manual
                        </Badge>
                      )}
                      {type === "level" && a.requiredLevel && (
                        <Badge variant="info">
                          <Star className="mr-1 inline h-3 w-3" />
                          Nivel {a.requiredLevel}
                        </Badge>
                      )}
                      {type === "missions" && (
                        <Badge variant="default">
                          <Target className="mr-1 inline h-3 w-3" />
                          {a.missions.length} misión{a.missions.length !== 1 ? "es" : ""}
                        </Badge>
                      )}
                      {type === "mission_count" && a.targetMissionCompletions && (
                        <Badge variant="default">
                          <Repeat className="mr-1 inline h-3 w-3" />
                          {a.targetMissionCompletions}× {a.targetMission?.title ?? "misión"}
                        </Badge>
                      )}
                    </div>
                    {type === "manual" && canManage(a) && (
                      <div className="mt-3 space-y-2">
                        {achievementUnlocks.length > 0 && (
                          <p className="text-xs text-slate-500">
                            Otorgado a:{" "}
                            {achievementUnlocks.map((u) => u.character.name).join(", ")}
                          </p>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openGrant(a)}>
                          Otorgar a jugador
                        </Button>
                      </div>
                    )}
                    {a.missions.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {a.missions.map(({ mission }) => (
                          <li key={mission.id} className="text-xs text-slate-500">• {mission.title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar logro" : "Nuevo logro"}
        description="Elige si se desbloquea por misiones, nivel o verificación manual."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              { value: "missions" as const, label: "Por misiones", icon: Target },
              { value: "mission_count" as const, label: "Repetir tarea", icon: Repeat },
              { value: "level" as const, label: "Por nivel", icon: Star },
              { value: "manual" as const, label: "Manual", icon: UserCheck },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAchievementType(value)}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm ${
                  achievementType === value
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <FormField label="Título" htmlFor="ach-title" required>
            <input
              id="ach-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ej: Maestro lector"
              required
            />
          </FormField>

          <FormField label="Descripción" htmlFor="ach-desc">
            <textarea
              id="ach-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
              rows={2}
              placeholder={
                achievementType === "manual"
                  ? "Ej: Leer un libro completo de principio a fin"
                  : "Opcional"
              }
            />
          </FormField>

          <FormField label="Cristales de recompensa" htmlFor="ach-crystals" required>
            <input
              id="ach-crystals"
              type="number"
              min={0}
              value={form.crystalReward}
              onChange={(e) => setForm({ ...form, crystalReward: Number(e.target.value) })}
              className={inputClass}
            />
          </FormField>

          {achievementType === "manual" ? (
            <p className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-400">
              Este logro no se desbloquea solo. Cuando compruebes que el jugador lo ha conseguido,
              pulsa <strong className="text-slate-300">Otorgar a jugador</strong> en la tarjeta del logro.
            </p>
          ) : achievementType === "level" ? (
            <FormField label="Nivel requerido" htmlFor="ach-level" required hint="Se desbloquea al alcanzar este nivel.">
              <input
                id="ach-level"
                type="number"
                min={2}
                value={form.requiredLevel}
                onChange={(e) => setForm({ ...form, requiredLevel: Number(e.target.value) })}
                className={inputClass}
              />
            </FormField>
          ) : achievementType === "mission_count" ? (
            <>
              <FormField label="Misión" required hint="La tarea que el jugador debe repetir.">
                <select
                  className={selectClass}
                  value={form.targetMissionId}
                  onChange={(e) => setForm({ ...form, targetMissionId: e.target.value })}
                  required
                >
                  <option value="">Selecciona una misión</option>
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Veces completada" htmlFor="ach-count" required>
                <input
                  id="ach-count"
                  type="number"
                  min={1}
                  value={form.targetMissionCompletions}
                  onChange={(e) => setForm({ ...form, targetMissionCompletions: Number(e.target.value) })}
                  className={inputClass}
                />
              </FormField>
            </>
          ) : (
            <FormField
              label={`Misiones requeridas (${form.selectedMissionIds.length})`}
              hint="El jugador debe completar todas las misiones seleccionadas."
            >
              {missions.length === 0 ? (
                <p className="text-sm text-slate-500">Crea misiones primero.</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-700 p-2">
                  {missions.map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedMissionIds.includes(m.id)}
                        onChange={() => toggleMission(m.id)}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm">{m.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </FormField>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Guardar" : "Crear logro"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        title="Otorgar logro"
        description={
          grantingAchievement
            ? `Marca "${grantingAchievement.title}" como conseguido por un jugador.`
            : undefined
        }
      >
        <form onSubmit={handleGrant} className="space-y-4">
          <FormField label="Jugador" htmlFor="grant-character" required>
            <select
              id="grant-character"
              className={selectClass}
              value={grantCharacterId}
              onChange={(e) => setGrantCharacterId(e.target.value)}
              required
            >
              <option value="">Selecciona un jugador</option>
              {characters
                .filter(
                  (c) =>
                    !grantingAchievement ||
                    !getUnlocksForAchievement(grantingAchievement.id).some((u) => u.characterId === c.id)
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setGrantModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={grantLoading || !grantCharacterId}>
              {grantLoading ? "Otorgando..." : "Otorgar logro"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
