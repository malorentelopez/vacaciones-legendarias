"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createBossBattle, addBossObjective } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { Swords, Info, CheckCircle2, Circle } from "lucide-react";

interface BossBattle {
  id: string;
  title: string;
  description: string | null;
  month: number;
  year: number;
  xpReward: number;
  crystalReward: number;
  objectives: { id: string; title: string; completed: boolean }[];
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function BossesManager({ bosses: initial }: { bosses: BossBattle[] }) {
  const [bosses, setBosses] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [xpReward, setXpReward] = useState(100);
  const [crystalReward, setCrystalReward] = useState(50);
  const [loading, setLoading] = useState(false);
  const [objectiveInputs, setObjectiveInputs] = useState<Record<string, string>>({});

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const boss = await createBossBattle({
      title,
      description: description || undefined,
      month,
      year: new Date().getFullYear(),
      xpReward,
      crystalReward,
    });
    setBosses([...bosses, { ...boss, objectives: [] }]);
    setModalOpen(false);
    setTitle("");
    setDescription("");
    setLoading(false);
  }

  async function handleAddObjective(bossId: string) {
    const objTitle = objectiveInputs[bossId]?.trim();
    if (!objTitle) return;
    await addBossObjective(bossId, { title: objTitle });
    setBosses(
      bosses.map((b) =>
        b.id === bossId
          ? { ...b, objectives: [...b.objectives, { id: `temp-${Date.now()}`, title: objTitle, completed: false }] }
          : b
      )
    );
    setObjectiveInputs({ ...objectiveInputs, [bossId]: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retos del mes"
        description="Grandes objetivos mensuales que el jugador completa paso a paso."
        actionLabel="Nuevo reto"
        onAction={() => setModalOpen(true)}
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
              Ejemplo: &quot;Proyecto de verano&quot; con objetivos como leer 3 libros, montar una tienda de limonada, etc.
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

          return (
            <Card key={boss.id} className="overflow-hidden border-red-500/20">
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
                    <Swords className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{boss.title}</h3>
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
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600" />
                      )}
                      <span className={obj.completed ? "text-slate-500 line-through" : "text-slate-300"}>
                        {obj.title}
                      </span>
                    </li>
                  ))}
                </ul>

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
              </div>
            </Card>
          );
        })
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo reto del mes"
        description="Define el gran objetivo y sus recompensas. Luego añade los pasos."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Título" htmlFor="boss-title" required>
            <input
              id="boss-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Ej: Proyecto de verano"
              required
            />
          </FormField>

          <FormField label="Descripción" htmlFor="boss-desc">
            <textarea
              id="boss-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaClass}
              rows={2}
              placeholder="Describe el reto general..."
            />
          </FormField>

          <FormField label="Mes" htmlFor="boss-month" required>
            <select
              id="boss-month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={selectClass}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="XP al completar" htmlFor="boss-xp">
              <input
                id="boss-xp"
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className={inputClass}
              />
            </FormField>
            <FormField label="Cristales al completar" htmlFor="boss-crystals">
              <input
                id="boss-crystals"
                type="number"
                min={0}
                value={crystalReward}
                onChange={(e) => setCrystalReward(Number(e.target.value))}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creando..." : "Crear reto"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
