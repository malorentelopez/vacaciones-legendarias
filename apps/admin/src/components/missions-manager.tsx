"use client";

import { useState } from "react";
import { Card, CardContent, Badge, Button } from "@repo/ui";
import { createMission, deleteMission } from "@/actions/admin";
import type { MissionFrequency, MissionType } from "@repo/database";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  frequency: MissionFrequency;
  type: MissionType;
  xpReward: number;
  crystalReward: number;
  isActive: boolean;
}

export function MissionsManager({ missions: initial }: { missions: Mission[] }) {
  const [missions, setMissions] = useState(initial);
  const [title, setTitle] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const mission = await createMission({
      title,
      frequency: "DAILY",
      type: "HABIT",
      xpReward,
    });
    setMissions([...missions, mission]);
    setTitle("");
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await deleteMission(id);
    setMissions(missions.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Misiones</h1>

      <Card className="p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la misión"
            required
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <input
            type="number"
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          />
          <Button type="submit" disabled={loading}>Crear</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {missions.map((m) => (
          <Card key={m.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">{m.title}</h3>
                <div className="mt-1 flex gap-2">
                  <Badge>{m.frequency}</Badge>
                  <Badge variant="info">+{m.xpReward} XP</Badge>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
