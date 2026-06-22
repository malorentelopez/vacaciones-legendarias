"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createMission, updateMission, deleteMission } from "@/actions/admin";
import type { MissionFrequency, MissionType } from "@repo/database";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButtons } from "@/components/ui/action-buttons";

interface Skill {
  id: string;
  name: string;
}

interface Mission {
  id: string;
  title: string;
  description: string | null;
  frequency: MissionFrequency;
  type: MissionType;
  xpReward: number;
  crystalReward: number;
  skillId: string | null;
  isActive: boolean;
  skill: { id: string; name: string } | null;
}

const FREQUENCIES: { value: MissionFrequency; label: string; color: string }[] = [
  { value: "DAILY", label: "Diaria", color: "bg-blue-500/20 text-blue-300" },
  { value: "WEEKLY", label: "Semanal", color: "bg-purple-500/20 text-purple-300" },
  { value: "MONTHLY", label: "Mensual", color: "bg-amber-500/20 text-amber-300" },
];

const TYPES: { value: MissionType; label: string }[] = [
  { value: "HABIT", label: "Hábito" },
  { value: "CREATIVE", label: "Creativa" },
  { value: "LEARNING", label: "Aprendizaje" },
  { value: "CHORE", label: "Tarea" },
  { value: "CUSTOM", label: "Personalizada" },
];

const TYPE_ICONS: Record<MissionType, string> = {
  HABIT: "🔄",
  CREATIVE: "🎨",
  LEARNING: "📚",
  CHORE: "🧹",
  CUSTOM: "⭐",
};

const emptyForm = {
  title: "",
  description: "",
  frequency: "DAILY" as MissionFrequency,
  type: "HABIT" as MissionType,
  xpReward: 10,
  crystalReward: 0,
  skillId: "",
};

export function MissionsManager({
  missions: initial,
  skills,
}: {
  missions: Mission[];
  skills: Skill[];
}) {
  const [missions, setMissions] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = missions.filter((m) => {
    if (filter === "active") return m.isActive;
    if (filter === "inactive") return !m.isActive;
    return true;
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(mission: Mission) {
    setEditingId(mission.id);
    setForm({
      title: mission.title,
      description: mission.description ?? "",
      frequency: mission.frequency,
      type: mission.type,
      xpReward: mission.xpReward,
      crystalReward: mission.crystalReward,
      skillId: mission.skillId ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      description: form.description || undefined,
      frequency: form.frequency,
      type: form.type,
      xpReward: form.xpReward,
      crystalReward: form.crystalReward,
      skillId: form.skillId || undefined,
    };

    if (editingId) {
      await updateMission(editingId, payload);
      setMissions(
        missions.map((m) =>
          m.id === editingId
            ? {
                ...m,
                title: form.title,
                description: form.description || null,
                frequency: form.frequency,
                type: form.type,
                xpReward: form.xpReward,
                crystalReward: form.crystalReward,
                skillId: form.skillId || null,
                skill: skills.find((s) => s.id === form.skillId) ?? null,
              }
            : m
        )
      );
    } else {
      const mission = await createMission(payload);
      setMissions([...missions, mission]);
    }

    setModalOpen(false);
    setLoading(false);
  }

  async function handleToggleActive(mission: Mission) {
    await updateMission(mission.id, { isActive: !mission.isActive });
    setMissions(missions.map((m) => (m.id === mission.id ? { ...m, isActive: !m.isActive } : m)));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta misión?")) return;
    await deleteMission(id);
    setMissions(missions.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Misiones"
        description="Define las tareas diarias, semanales o mensuales de los jugadores."
        actionLabel="Nueva misión"
        onAction={openCreate}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${
              filter === f ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {f === "all" ? "Todas" : f === "active" ? "Activas" : "Inactivas"}
            {" "}
            ({f === "all" ? missions.length : missions.filter((m) => f === "active" ? m.isActive : !m.isActive).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          No hay misiones {filter !== "all" ? "con este filtro" : ""}.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((m) => {
            const freq = FREQUENCIES.find((f) => f.value === m.frequency);
            return (
              <Card key={m.id} className={`overflow-hidden ${!m.isActive ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                    {TYPE_ICONS[m.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold leading-tight">{m.title}</h3>
                      <ActionButtons
                        onEdit={() => openEdit(m)}
                        onToggle={() => handleToggleActive(m)}
                        isActive={m.isActive}
                        onDelete={() => handleDelete(m.id)}
                      />
                    </div>
                    {m.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{m.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${freq?.color}`}>
                        {freq?.label}
                      </span>
                      <Badge variant="default">{TYPES.find((t) => t.value === m.type)?.label}</Badge>
                      {m.skill && <Badge variant="info">{m.skill.name}</Badge>}
                      <Badge variant="info">+{m.xpReward} XP</Badge>
                      {m.crystalReward > 0 && <Badge variant="warning">+{m.crystalReward} 💎</Badge>}
                    </div>
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
        title={editingId ? "Editar misión" : "Nueva misión"}
        description="Configura la tarea, recompensas y frecuencia."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Título" htmlFor="mission-title" required>
            <input
              id="mission-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ej: Leer 30 minutos"
              required
            />
          </FormField>

          <FormField label="Descripción" htmlFor="mission-desc" hint="Opcional. Explica qué hay que hacer.">
            <textarea
              id="mission-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
              rows={2}
              placeholder="Detalles de la misión..."
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Frecuencia" htmlFor="mission-freq" required>
              <select
                id="mission-freq"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as MissionFrequency })}
                className={selectClass}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Tipo" htmlFor="mission-type" required>
              <select
                id="mission-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MissionType })}
                className={selectClass}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Skill asociada" htmlFor="mission-skill" hint="La XP de la misión sumará a esta habilidad.">
            <select
              id="mission-skill"
              value={form.skillId}
              onChange={(e) => setForm({ ...form, skillId: e.target.value })}
              className={selectClass}
            >
              <option value="">Ninguna</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Recompensa XP" htmlFor="mission-xp" required>
              <input
                id="mission-xp"
                type="number"
                min={0}
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Recompensa cristales" htmlFor="mission-crystals">
              <input
                id="mission-crystals"
                type="number"
                min={0}
                value={form.crystalReward}
                onChange={(e) => setForm({ ...form, crystalReward: Number(e.target.value) })}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Actualizar" : "Crear misión"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
