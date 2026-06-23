"use client";

import { useState, useEffect } from "react";
import { Card, Badge, Button } from "@repo/ui";
import {
  createReward,
  updateReward,
  deleteReward,
  updatePurchaseStatus,
  getPendingPurchases,
} from "@/actions/admin";
import type { RewardStatus } from "@repo/database";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Gift, Check, X } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  crystalCost: number;
  familyId: string | null;
}

interface Purchase {
  id: string;
  status: RewardStatus;
  purchasedAt: Date;
  reward: { title: string; crystalCost: number };
  character: { name: string };
}

const emptyForm = {
  title: "",
  description: "",
  crystalCost: 10,
};

export function RewardsManager({
  rewards: initial,
  familyId,
}: {
  rewards: Reward[];
  familyId: string;
}) {
  const [rewards, setRewards] = useState(initial);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPendingPurchases().then(setPurchases);
  }, []);

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
        crystalCost: form.crystalCost,
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

  async function handleApprove(purchaseId: string, status: RewardStatus) {
    await updatePurchaseStatus(purchaseId, status);
    setPurchases(purchases.filter((p) => p.id !== purchaseId));
  }

  function canManage(r: Reward) {
    return r.familyId === familyId;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recompensas"
        description="Artículos que los jugadores pueden comprar con cristales en la tienda."
        actionLabel="Nueva recompensa"
        onAction={openCreate}
      />

      {purchases.length > 0 && (
        <Card className="overflow-hidden border-amber-500/30">
          <div className="bg-amber-500/10 px-5 py-3">
            <h2 className="font-semibold text-amber-400">
              Pendientes de aprobación ({purchases.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-800">
            {purchases.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{p.reward.title}</p>
                  <p className="text-sm text-slate-400">
                    {p.character.name} · 💎 {p.reward.crystalCost}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(p.id, "APPROVED")}>
                    <Check className="mr-1 h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleApprove(p.id, "REJECTED")}>
                    <X className="mr-1 h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar recompensa" : "Nueva recompensa"}
        description="Los jugadores podrán comprarla con cristales. Tú apruebas cada compra."
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
