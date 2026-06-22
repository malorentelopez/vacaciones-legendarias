"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { upsertLevel } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { BarChart3, Pencil, Star } from "lucide-react";

interface Level {
  level: number;
  xpRequired: number;
  crystalReward: number;
}

const emptyForm = { level: 1, xpRequired: 0, crystalReward: 0 };

export function LevelsManager({ levels: initial }: { levels: Level[] }) {
  const [levels, setLevels] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  function openCreate() {
    const nextLevel = levels.length > 0 ? Math.max(...levels.map((l) => l.level)) + 1 : 1;
    setForm({ level: nextLevel, xpRequired: 0, crystalReward: 0 });
    setIsEditing(false);
    setModalOpen(true);
  }

  function openEdit(level: Level) {
    setForm({ level: level.level, xpRequired: level.xpRequired, crystalReward: level.crystalReward });
    setIsEditing(true);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await upsertLevel(form.level, form.xpRequired, form.crystalReward);

    const existing = levels.findIndex((l) => l.level === form.level);
    const updated = { ...form };
    if (existing >= 0) {
      const newLevels = [...levels];
      newLevels[existing] = updated;
      setLevels(newLevels.sort((a, b) => a.level - b.level));
    } else {
      setLevels([...levels, updated].sort((a, b) => a.level - b.level));
    }

    setModalOpen(false);
    setLoading(false);
  }

  const maxXp = levels.length > 0 ? Math.max(...levels.map((l) => l.xpRequired)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Niveles"
        description="Define cuánta XP se necesita para subir de nivel y la recompensa en cristales."
        actionLabel="Configurar nivel"
        onAction={openCreate}
      />

      {levels.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-violet-400/50" />
          Configura los niveles de progresión.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((l) => {
            const prev = levels.find((x) => x.level === l.level - 1);
            const xpInLevel = prev ? l.xpRequired - prev.xpRequired : l.xpRequired;
            const progress = maxXp > 0 ? (l.xpRequired / maxXp) * 100 : 0;

            return (
              <button key={l.level} type="button" onClick={() => openEdit(l)} className="text-left">
                <Card className="overflow-hidden transition-all hover:border-violet-500/50">
                  <div
                    className="h-1 bg-gradient-to-r from-violet-500 to-emerald-500"
                    style={{ width: `${Math.max(20, progress)}%` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                          <Star className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-bold">Nivel {l.level}</h3>
                          <p className="text-xs text-slate-500">{l.xpRequired} XP total</p>
                        </div>
                      </div>
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="info">+{xpInLevel} XP</Badge>
                      {l.crystalReward > 0 && (
                        <Badge variant="warning">+{l.crystalReward} 💎</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Editar nivel ${form.level}` : "Configurar nivel"}
        description="La XP es acumulativa: el jugador sube al alcanzar el umbral total."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Número de nivel" htmlFor="level-num" required hint="Debe ser único.">
            <input
              id="level-num"
              type="number"
              min={1}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
              className={inputClass}
              disabled={isEditing}
              required
            />
          </FormField>

          <FormField
            label="XP total requerida"
            htmlFor="level-xp"
            required
            hint="XP acumulada que el jugador debe alcanzar para llegar a este nivel."
          >
            <input
              id="level-xp"
              type="number"
              min={0}
              value={form.xpRequired}
              onChange={(e) => setForm({ ...form, xpRequired: Number(e.target.value) })}
              className={inputClass}
              required
            />
          </FormField>

          <FormField label="Cristales al subir" htmlFor="level-crystals" hint="Recompensa automática al alcanzar este nivel.">
            <input
              id="level-crystals"
              type="number"
              min={0}
              value={form.crystalReward}
              onChange={(e) => setForm({ ...form, crystalReward: Number(e.target.value) })}
              className={inputClass}
            />
          </FormField>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar nivel"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
