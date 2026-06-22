"use client";

import { selectCharacter } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge, CharacterPortrait, AppLogo } from "@repo/ui";
import { getTheme, getRoleName, getRoleImage, normalizeRoleKey } from "@repo/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Character {
  id: string;
  name: string;
  level: number;
  gender: "BOY" | "GIRL";
  themeKey: string;
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
        <AppLogo variant="full" size="md" className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-violet-300">¿Quién juega hoy?</h1>
        <p className="text-slate-400">Elige tu personaje</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {characters.map((character) => {
          const genderKey = character.gender === "BOY" ? "boy" : "girl";
          const theme = getTheme(character.themeKey);
          const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);
          const roleName = getRoleName(character.themeKey, genderKey, roleKey);

          return (
            <button
              key={character.id}
              onClick={() => handleSelect(character.id)}
              disabled={loading === character.id}
              className="text-left"
            >
              <Card className="overflow-hidden transition-all hover:border-violet-500/50 hover:shadow-violet-500/10">
                <div
                  className="h-1"
                  style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                />
                <CardHeader className="flex-row items-center gap-4">
                  <CharacterPortrait
                    imageSrc={getRoleImage(character.themeKey, genderKey, roleKey)}
                    alt={roleName}
                    primaryColor={theme.colors.primary}
                    secondaryColor={theme.colors.secondary}
                    size="lg"
                  />
                  <div>
                    <CardTitle>{character.name}</CardTitle>
                    <p className="text-sm text-slate-400">{roleName}</p>
                    <Badge variant="info" className="mt-1">Nivel {character.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-violet-400">
                    {loading === character.id ? "Cargando..." : "Seleccionar →"}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
