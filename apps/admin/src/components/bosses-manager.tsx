"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import {
  createBossBattle,
  updateBossBattle,
  deleteBossBattle,
  addBossObjective,
  deleteBossObjective,
} from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Swords, Info, CheckCircle2, Circle, X } from "lucide-react";

interface BossBattle {
  id: string;
  title: string;
  description: string | null;
  month: number;
  year: number;
  xpReward: number;
  crystalReward: number;
  familyId: string | null;
  objectives: { id: string; title: string; completed: boolean }[];
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const emptyForm = {
  title: "",
  description: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  xpReward: 100,
  crystalReward: 50,
};

export function BossesManager({
  bosses: initial,
  familyId,
}: {
  bosses: BossBattle[];
  familyId: string;
}) {
  const [bosses, setBosses] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [objectiveInputs, setObjectiveInputs] = useState<Record<string, string>>({});

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    setModalOpen(true);
  }

  function openEdit(boss: BossBattle) {
    setEditingId(boss.id);
    setForm({
      title: boss.title,
      description: boss.description ?? "",
      month: boss.month,
      year: boss.year,
      xpReward: boss.xpReward,
      crystalReward: boss.crystalReward,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        month: form.month,
        year: form.year,
        xpReward: form.xpReward,
        crystalReward: form.crystalReward,
      };

      if (editingId) {
        const updated = await updateBossBattle(editingId, payload);
        setBosses(
          bosses.map((b) =>
            b.id === editingId ? { ...(updated as BossBattle), objectives: b.objectives } : b
          )
        );
      } else {
        const boss = await createBossBattle(payload);
        setBosses([...bosses, { ...(boss as BossBattle), objectives: [] }]);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este reto del mes y todos sus objetivos?")) return;
    try {
      await deleteBossBattle(id);
      setBosses(bosses.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  async function handleAddObjective(bossId: string) {
    const objTitle = objectiveInputs[bossId]?.trim();
    if (!objTitle) return;
    try {
      const objective = await addBossObjective(bossId, { title: objTitle });
      setBosses(
        bosses.map((b) =>
          b.id === bossId
            ? {
                ...b,
                objectives: [
                  ...b.objectives,
                  { id: objective.id, title: objective.title, completed: false },
                ],
              }
            : b
        )
      );
      setObjectiveInputs({ ...objectiveInputs, [bossId]: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al añadir objetivo");
    }
  }

  async function handleDeleteObjective(bossId: string, objectiveId: string) {
    if (!confirm("¿Eliminar este objetivo?")) return;
    try {
      await deleteBossObjective(bossId, objectiveId);
      setBosses(
        bosses.map((b) =>
          b.id === bossId
            ? { ...b, objectives: b.objectives.filter((o) => o.id !== objectiveId) }
            : b
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  function canManage(boss: BossBattle) {
    return boss.familyId === familyId;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retos del mes"
        description="Grandes objetivos mensuales que el jugador completa paso a paso."
        actionLabel="Nuevo reto"
        onAction={openCreate}
      />

      <Card className="border-violet-500/30 bg-violet-500/5 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-violet-400 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-violet-300">¿Qué son los retos del mes?</p>
            <p className="mt-1 text-slate-400">
              Son el <strong>gran objetivo del mes</strong>, como un jefe final en un videojuego.
              Defines varios pasos (objetivos) que el niño debe completar durante julio o agosto.
              Cuando completa todos, recibe una gran recompensa de XP y cristales.
            </p>
          </div>
        </div>
      </Card>

      {bosses.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Swords className="mx-auto mb-3 h-10 w-10 text-red-400/50" />
          Crea el primer reto mensual del verano.
        </Card>
      ) : (
        bosses.map((boss) => {
          const completedCount = boss.objectives.filter((o) => o.completed).length;
          const total = boss.objectives.length;
          const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
          const manageable = canManage(boss);

          return (
            <Card key={boss.id} className="overflow-hidden border-red-500/20">
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
                    <Swords className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{boss.title}</h3>
                      {manageable && (
                        <ActionButtons
                          onEdit={() => openEdit(boss)}
                          onDelete={() => handleDelete(boss.id)}
                        />
                      )}
                    </div>
                    <Badge className="mt-1">{MONTHS[boss.month - 1]} {boss.year}</Badge>
                    {boss.description && (
                      <p className="mt-2 text-sm text-slate-400">{boss.description}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Badge variant="info">+{boss.xpReward} XP</Badge>
                      <Badge variant="warning">+{boss.crystalReward} 💎</Badge>
                    </div>
                  </div>
                </div>

                {total > 0 && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Progreso</span>
                      <span>{completedCount}/{total} ({progress}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <ul className="mt-4 space-y-2">
                  {boss.objectives.map((obj) => (
                    <li key={obj.id} className="flex items-center gap-2 text-sm">
                      {obj.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-slate-600" />
                      )}
                      <span className={`flex-1 ${obj.completed ? "text-slate-500 line-through" : "text-slate-300"}`}>
                        {obj.title}
                      </span>
                      {manageable && !obj.completed && (
                        <button
                          type="button"
                          onClick={() => handleDeleteObjective(boss.id, obj.id)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                          aria-label="Eliminar objetivo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {manageable && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={objectiveInputs[boss.id] ?? ""}
                      onChange={(e) => setObjectiveInputs({ ...objectiveInputs, [boss.id]: e.target.value })}
                      placeholder="Nuevo objetivo..."
                      className={inputClass}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddObjective(boss.id))}
                    />
                    <Button size="sm" onClick={() => handleAddObjective(boss.id)}>Añadir</Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar reto del mes" : "Nuevo reto del mes"}
        description="Define el gran objetivo y sus recompensas. Luego añade los pasos."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Título" htmlFor="boss-title" required>
            <input
              id="boss-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ej: Proyecto de verano"
              required
            />
          </FormField>

          <FormField label="Descripción" htmlFor="boss-desc">
            <textarea
              id="boss-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
              rows={2}
              placeholder="Describe el reto general..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mes" htmlFor="boss-month" required>
              <select
                id="boss-month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className={selectClass}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Año" htmlFor="boss-year" required>
              <input
                id="boss-year"
                type="number"
                min={2024}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="XP al completar" htmlFor="boss-xp">
              <input
                id="boss-xp"
                type="number"
                min={0}
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Cristales al completar" htmlFor="boss-crystals">
              <input
                id="boss-crystals"
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
              {loading ? "Guardando..." : editingId ? "Guardar" : "Crear reto"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
