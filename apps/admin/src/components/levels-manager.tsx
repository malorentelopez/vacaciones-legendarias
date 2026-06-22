"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { upsertLevel } from "@/actions/admin";

interface Level {
  level: number;
  xpRequired: number;
  crystalReward: number;
}

export function LevelsManager({ levels: initial }: { levels: Level[] }) {
  const [levels, setLevels] = useState(initial);
  const [level, setLevel] = useState(levels.length + 1);
  const [xpRequired, setXpRequired] = useState(0);
  const [crystalReward, setCrystalReward] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await upsertLevel(level, xpRequired, crystalReward);
    const existing = levels.findIndex((l) => l.level === level);
    const updated = { level, xpRequired, crystalReward };
    if (existing >= 0) {
      const newLevels = [...levels];
      newLevels[existing] = updated;
      setLevels(newLevels.sort((a, b) => a.level - b.level));
    } else {
      setLevels([...levels, updated].sort((a, b) => a.level - b.level));
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración de Niveles</h1>

      <Card className="p-4">
        <form onSubmit={handleSave} className="flex flex-wrap gap-3">
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            placeholder="Nivel"
            className="w-20 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <input
            type="number"
            value={xpRequired}
            onChange={(e) => setXpRequired(Number(e.target.value))}
            placeholder="XP requerida"
            className="w-32 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <input
            type="number"
            value={crystalReward}
            onChange={(e) => setCrystalReward(Number(e.target.value))}
            placeholder="Cristales"
            className="w-28 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <Button type="submit" disabled={loading}>Guardar</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {levels.map((l) => (
          <Card key={l.level} className="flex items-center justify-between p-4">
            <span className="font-bold">Nivel {l.level}</span>
            <div className="flex gap-2">
              <Badge variant="info">{l.xpRequired} XP</Badge>
              <Badge variant="warning">+{l.crystalReward} 💎</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
