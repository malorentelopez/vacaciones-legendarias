"use client";

import { selectCharacter } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, SkillIcon } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Character {
  id: string;
  name: string;
  level: number;
  avatarBase: string;
}

export function CharacterSelector({ characters }: { characters: Character[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(characterId: string) {
    setLoading(characterId);
    await selectCharacter(characterId);
    router.refresh();
  }

  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-violet-300">¿Quién juega hoy?</h1>
        <p className="text-slate-400">Elige tu personaje</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => handleSelect(character.id)}
            disabled={loading === character.id}
            className="text-left"
          >
            <Card className="transition-all hover:border-violet-500/50 hover:shadow-violet-500/10">
              <CardHeader className="flex-row items-center gap-4">
                <SkillIcon icon="user" color="#8b5cf6" size="lg" />
                <div>
                  <CardTitle>{character.name}</CardTitle>
                  <p className="text-sm text-slate-400">Nivel {character.level}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-violet-400">
                  {loading === character.id ? "Cargando..." : "Seleccionar →"}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
