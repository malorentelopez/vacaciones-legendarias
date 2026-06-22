"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { createBossBattle, addBossObjective } from "@/actions/admin";

interface BossBattle {
  id: string;
  title: string;
  description: string | null;
  month: number;
  year: number;
  objectives: { id: string; title: string; completed: boolean }[];
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function BossesManager({ bosses: initial }: { bosses: BossBattle[] }) {
  const [bosses, setBosses] = useState(initial);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(7);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const boss = await createBossBattle({
      title,
      month,
      year: new Date().getFullYear(),
      xpReward: 100,
      crystalReward: 50,
    });
    setBosses([...bosses, { ...boss, objectives: [] }]);
    setTitle("");
    setLoading(false);
  }

  async function handleAddObjective(bossId: string, objTitle: string) {
    await addBossObjective(bossId, { title: objTitle });
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Boss Battles</h1>

      <Card className="p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del boss"
            required
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <Button type="submit" disabled={loading}>Crear</Button>
        </form>
      </Card>

      {bosses.map((boss) => (
        <Card key={boss.id} className="p-4">
          <h3 className="font-bold">{boss.title}</h3>
          <Badge className="mt-1">{MONTHS[boss.month - 1]} {boss.year}</Badge>
          <ul className="mt-3 space-y-1">
            {boss.objectives.map((obj) => (
              <li key={obj.id} className="text-sm text-slate-300">
                {obj.completed ? "✅" : "⬜"} {obj.title}
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).objective as HTMLInputElement;
              handleAddObjective(boss.id, input.value);
              input.value = "";
            }}
            className="mt-3 flex gap-2"
          >
            <input
              name="objective"
              placeholder="Nuevo objetivo"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1 text-sm"
            />
            <Button type="submit" size="sm">Añadir</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
