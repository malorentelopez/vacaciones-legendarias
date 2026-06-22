"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@repo/ui";
import { createCharacter } from "@/actions/admin";

interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  crystals: number;
  weeklyPoints: number;
}

export function CharactersManager({ characters: initial }: { characters: Character[] }) {
  const [characters, setCharacters] = useState(initial);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const character = await createCharacter({ name, pin: pin || undefined });
    setCharacters([...characters, character]);
    setName("");
    setPin("");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Personajes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Crear personaje</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              required
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN (4 dígitos)"
              maxLength={4}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {characters.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold">{c.name}</h3>
              <div className="mt-2 flex gap-2">
                <Badge variant="info">Nv. {c.level}</Badge>
                <Badge variant="default">{c.xp} XP</Badge>
                <Badge variant="warning">💎 {c.crystals}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
