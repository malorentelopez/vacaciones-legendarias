"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createReward, updateReward, deleteReward } from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButtons } from "@/components/ui/action-buttons";
import { RewardBalanceHint } from "@/components/reward-balance-hint";
import {
  RewardPurchasesPanel,
  type RewardPurchaseRow,
} from "@/components/reward-purchases-panel";
import { Gift } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  crystalCost: number;
  maxPurchases: number | null;
  requiredLevel: number | null;
  familyId: string | null;
}

const emptyForm = {
  title: "",
  description: "",
  crystalCost: 10,
  maxPurchases: "unlimited" as "1" | "unlimited",
  requiredLevel: "" as string,
};

export function RewardsManager({
  rewards: initial,
  purchases: initialPurchases,
  familyId,
}: {
  rewards: Reward[];
  purchases: RewardPurchaseRow[];
  familyId: string;
}) {
  const [rewards, setRewards] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(r: Reward) {
    setEditingId(r.id);
    setForm({
      title: r.title,
      description: r.description ?? "",
      crystalCost: r.crystalCost,
      maxPurchases: r.maxPurchases === 1 ? "1" : "unlimited",
      requiredLevel: r.requiredLevel != null ? String(r.requiredLevel) : "",
    });
    setModalOpen(true);
  }

  function parseRequiredLevel(value: string): number | null {
    const parsed = Number(value);
    if (!value.trim() || !Number.isFinite(parsed) || parsed < 1) return null;
    return Math.floor(parsed);
  }

  function parseMaxPurchases(value: "1" | "unlimited"): number | null {
    if (value === "1") return 1;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        crystalCost: form.crystalCost,
        maxPurchases: parseMaxPurchases(form.maxPurchases),
        requiredLevel: parseRequiredLevel(form.requiredLevel),
      };
      if (editingId) {
        const updated = await updateReward(editingId, payload);
        setRewards(rewards.map((r) => (r.id === editingId ? (updated as Reward) : r)));
      } else {
        const created = await createReward(payload);
        setRewards([...rewards, created as Reward]);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta recompensa de la tienda?")) return;
    try {
      await deleteReward(id);
      setRewards(rewards.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  function canManage(r: Reward) {
    return r.familyId === familyId;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recompensas"
        description="Gestiona la tienda, aprueba los canjes y marca cuándo se ha entregado cada premio."
        actionLabel="Nueva recompensa"
        onAction={openCreate}
      />

      <RewardPurchasesPanel purchases={initialPurchases} />

      <div>
        <h2 className="mb-4 text-xl font-bold">Artículos de la tienda</h2>
        {rewards.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Gift className="mx-auto mb-3 h-10 w-10 text-violet-400/50" />
            Crea la primera recompensa para la tienda.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
                    <Gift className="h-6 w-6 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{r.title}</h3>
                      {canManage(r) && (
                        <ActionButtons
                          onEdit={() => openEdit(r)}
                          onDelete={() => handleDelete(r.id)}
                        />
                      )}
                    </div>
                    {r.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">{r.description}</p>
                    )}
                    <Badge variant="warning" className="mt-2">
                      💎 {r.crystalCost}
                    </Badge>
                    {r.requiredLevel != null && (
                      <Badge variant="default" className="mt-2 ml-2">
                        Nivel {r.requiredLevel}
                      </Badge>
                    )}
                    {r.maxPurchases === 1 && (
                      <Badge variant="info" className="mt-2 ml-2">
                        Compra única
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar recompensa" : "Nueva recompensa"}
        description="Los jugadores podrán comprarla con cristales. Tú apruebas cada compra. Elige «Solo una vez» para premios que no se pueden repetir."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Título" htmlFor="reward-title" required>
            <input
              id="reward-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ej: Helado extra"
              required
            />
          </FormField>

          <FormField label="Descripción" htmlFor="reward-desc" hint="Opcional. Detalla qué incluye la recompensa.">
            <textarea
              id="reward-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
              rows={2}
              placeholder="Ej: Un helado a elegir del supermercado"
            />
          </FormField>

          <FormField label="Coste en cristales" htmlFor="reward-cost" required>
            <input
              id="reward-cost"
              type="number"
              min={1}
              value={form.crystalCost}
              onChange={(e) => setForm({ ...form, crystalCost: Number(e.target.value) })}
              className={inputClass}
              required
            />
          </FormField>

          <FormField
            label="Nivel requerido"
            htmlFor="reward-required-level"
            hint="Opcional. El jugador solo podrá canjearla al alcanzar este nivel."
          >
            <input
              id="reward-required-level"
              type="number"
              min={1}
              value={form.requiredLevel}
              onChange={(e) => setForm({ ...form, requiredLevel: e.target.value })}
              className={inputClass}
              placeholder="Sin requisito"
            />
          </FormField>

          <FormField
            label="Límite de compras"
            htmlFor="reward-max-purchases"
            hint="Útil para premios especiales que solo se pueden conseguir una vez."
          >
            <select
              id="reward-max-purchases"
              value={form.maxPurchases || "unlimited"}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxPurchases: e.target.value as "1" | "unlimited",
                })
              }
              className={inputClass}
            >
              <option value="unlimited">Ilimitado</option>
              <option value="1">Solo una vez</option>
            </select>
          </FormField>

          <RewardBalanceHint
            crystalCost={form.crystalCost}
            maxPurchases={parseMaxPurchases(form.maxPurchases)}
          />

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Guardar" : "Crear recompensa"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
