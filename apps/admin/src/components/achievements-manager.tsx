"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createAchievement } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { Trophy, Target, Star } from "lucide-react";

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
  crystalReward: number;
  missions: AchievementMission[];
}

type AchievementType = "missions" | "level";

const emptyForm = {
  title: "",
  description: "",
  crystalReward: 10,
  requiredLevel: 3,
  selectedMissionIds: [] as string[],
};

export function AchievementsManager({
  achievements: initial,
  missions,
}: {
  achievements: Achievement[];
  missions: Mission[];
}) {
  const [achievements, setAchievements] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [achievementType, setAchievementType] = useState<AchievementType>("missions");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setForm(emptyForm);
    setAchievementType("missions");
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (achievementType === "missions" && form.selectedMissionIds.length === 0) {
      setError("Selecciona al menos una misión");
      return;
    }

    setLoading(true);
    const achievement = await createAchievement({
      title: form.title,
      description: form.description || undefined,
      crystalReward: form.crystalReward,
      ...(achievementType === "missions"
        ? { missionIds: form.selectedMissionIds }
        : { requiredLevel: form.requiredLevel }),
    });
    setAchievements([...achievements, achievement]);
    setModalOpen(false);
    setLoading(false);
  }

  function getAchievementType(a: Achievement): AchievementType {
    if (a.requiredLevel) return "level";
    return "missions";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logros"
        description="Insignias que los jugadores desbloquean al completar misiones o subir de nivel."
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
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                    <Trophy className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{a.title}</h3>
                    {a.description && (
                      <p className="mt-0.5 text-sm text-slate-400">{a.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="warning">+{a.crystalReward} 💎</Badge>
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
                    </div>
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
        title="Nuevo logro"
        description="Elige si se desbloquea por misiones o por subir de nivel."
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "missions" as const, label: "Por misiones", icon: Target },
              { value: "level" as const, label: "Por nivel", icon: Star },
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
              placeholder="Opcional"
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

          {achievementType === "level" ? (
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
              {loading ? "Creando..." : "Crear logro"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
