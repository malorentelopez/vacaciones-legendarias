"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createReward, updatePurchaseStatus, getPendingPurchases } from "@/actions/admin";
import type { RewardStatus } from "@repo/database";
import { useEffect } from "react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  crystalCost: number;
}

interface Purchase {
  id: string;
  status: RewardStatus;
  purchasedAt: Date;
  reward: { title: string; crystalCost: number };
  character: { name: string };
}

export function RewardsManager({ rewards: initial }: { rewards: Reward[] }) {
  const [rewards, setRewards] = useState(initial);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [title, setTitle] = useState("");
  const [crystalCost, setCrystalCost] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPendingPurchases().then(setPurchases);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const reward = await createReward({ title, crystalCost });
    setRewards([...rewards, reward]);
    setTitle("");
    setLoading(false);
  }

  async function handleApprove(purchaseId: string, status: RewardStatus) {
    await updatePurchaseStatus(purchaseId, status);
    setPurchases(purchases.filter((p) => p.id !== purchaseId));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recompensas</h1>

      {purchases.length > 0 && (
        <Card className="border-amber-500/30 p-4">
          <h2 className="mb-3 font-bold text-amber-400">Pendientes de aprobación</h2>
          {purchases.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <span>{p.character.name} — {p.reward.title} (💎 {p.reward.crystalCost})</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleApprove(p.id, "APPROVED")}>Aprobar</Button>
                <Button size="sm" variant="destructive" onClick={() => handleApprove(p.id, "REJECTED")}>Rechazar</Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card className="p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            required
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <input
            type="number"
            value={crystalCost}
            onChange={(e) => setCrystalCost(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <Button type="submit" disabled={loading}>Crear</Button>
        </form>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {rewards.map((r) => (
          <Card key={r.id} className="p-4">
            <h3 className="font-bold">{r.title}</h3>
            <Badge variant="warning" className="mt-2">💎 {r.crystalCost}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
