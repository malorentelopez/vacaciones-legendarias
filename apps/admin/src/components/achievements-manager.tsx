"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createAchievement } from "@/actions/admin";

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  requiredLevel: number | null;
  requiredMissions: number | null;
  crystalReward: number;
}

export function AchievementsManager({ achievements: initial }: { achievements: Achievement[] }) {
  const [achievements, setAchievements] = useState(initial);
  const [title, setTitle] = useState("");
  const [requiredMissions, setRequiredMissions] = useState(5);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const achievement = await createAchievement({ title, requiredMissions, crystalReward: 10 });
    setAchievements([...achievements, achievement]);
    setTitle("");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Logros</h1>

      <Card className="p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del logro"
            required
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <input
            type="number"
            value={requiredMissions}
            onChange={(e) => setRequiredMissions(Number(e.target.value))}
            placeholder="Misiones req."
            className="w-28 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <Button type="submit" disabled={loading}>Crear</Button>
        </form>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <Card key={a.id} className="p-4">
            <h3 className="font-bold">{a.title}</h3>
            {a.description && <p className="text-sm text-slate-400">{a.description}</p>}
            <div className="mt-2 flex gap-2">
              {a.requiredMissions && <Badge>{a.requiredMissions} misiones</Badge>}
              {a.requiredLevel && <Badge variant="info">Nv. {a.requiredLevel}</Badge>}
              <Badge variant="warning">+{a.crystalReward} 💎</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
