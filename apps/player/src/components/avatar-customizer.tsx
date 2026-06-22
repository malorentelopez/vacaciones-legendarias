"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@repo/ui";
import { updateAvatar } from "@/actions/game";

const AVATARS = [
  { key: "default", emoji: "🧙", name: "Mago" },
  { key: "knight", emoji: "⚔️", name: "Caballero" },
  { key: "archer", emoji: "🏹", name: "Arquero" },
  { key: "wizard", emoji: "🔮", name: "Hechicero" },
  { key: "explorer", emoji: "🗺️", name: "Explorador" },
  { key: "ninja", emoji: "🥷", name: "Ninja" },
];

export function AvatarCustomizer({ currentAvatar }: { currentAvatar: string }) {
  const [selected, setSelected] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await updateAvatar(selected, { base: selected });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-violet-300">Personaliza tu Avatar</h1>

      <Card className="p-8 text-center">
        <div className="text-8xl mb-4">
          {AVATARS.find((a) => a.key === selected)?.emoji ?? "🧙"}
        </div>
        <p className="text-lg text-violet-300">
          {AVATARS.find((a) => a.key === selected)?.name ?? "Aventurero"}
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.key}
            onClick={() => setSelected(avatar.key)}
            className={`rounded-2xl border p-4 text-center transition-all ${
              selected === avatar.key
                ? "border-violet-500 bg-violet-500/20"
                : "border-slate-700 hover:border-slate-500"
            }`}
          >
            <div className="text-3xl">{avatar.emoji}</div>
            <p className="mt-1 text-xs">{avatar.name}</p>
          </button>
        ))}
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Guardar avatar"}
      </Button>
    </div>
  );
}
