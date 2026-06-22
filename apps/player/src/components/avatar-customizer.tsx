"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@repo/ui";
import { updateAvatar } from "@/actions/game";
import { THEME_LIST, getTheme, type CharacterGender } from "@repo/domain";
import { useRouter } from "next/navigation";

interface CharacterProfile {
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
}

const GENDER_OPTIONS: { value: "BOY" | "GIRL"; label: string; icon: string }[] = [
  { value: "BOY", label: "Chico", icon: "👦" },
  { value: "GIRL", label: "Chica", icon: "👧" },
];

export function AvatarCustomizer({ character }: { character: CharacterProfile }) {
  const router = useRouter();
  const [name, setName] = useState(character.name);
  const [gender, setGender] = useState<"BOY" | "GIRL">(character.gender);
  const [themeKey, setThemeKey] = useState(character.themeKey);
  const [avatarBase, setAvatarBase] = useState(character.avatarBase);
  const [loading, setLoading] = useState(false);

  const genderKey: CharacterGender = gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(themeKey);
  const avatars = theme.avatars[genderKey] ?? [];
  const selectedAvatar = avatars.find((a) => a.key === avatarBase) ?? avatars[0];

  function handleThemeChange(newThemeKey: string) {
    setThemeKey(newThemeKey);
    const newTheme = getTheme(newThemeKey);
    const newAvatars = newTheme.avatars[genderKey] ?? [];
    if (newAvatars.length > 0 && !newAvatars.find((a) => a.key === avatarBase)) {
      setAvatarBase(newAvatars[0].key);
    }
  }

  function handleGenderChange(newGender: "BOY" | "GIRL") {
    setGender(newGender);
    const gKey: CharacterGender = newGender === "BOY" ? "boy" : "girl";
    const newAvatars = getTheme(themeKey).avatars[gKey] ?? [];
    if (newAvatars.length > 0 && !newAvatars.find((a) => a.key === avatarBase)) {
      setAvatarBase(newAvatars[0].key);
    }
  }

  async function handleSave() {
    setLoading(true);
    await updateAvatar({ name, gender, themeKey, avatarBase, avatarConfig: { base: avatarBase } });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: theme.colors.heading }}>
        Tu personaje
      </h1>

      <Card className="p-8 text-center">
        <div className="text-8xl mb-4">{selectedAvatar?.emoji ?? "🧙"}</div>
        <p className="text-lg" style={{ color: theme.colors.heading }}>
          {name || "Sin nombre"}
        </p>
        <Badge className="mt-2">{theme.name}</Badge>
      </Card>

      <Card className="p-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del personaje"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Sexo</label>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleGenderChange(opt.value)}
                className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                  gender === opt.value
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <div className="text-2xl">{opt.icon}</div>
                <p className="mt-1 text-sm">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Tema</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_LIST.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleThemeChange(t.key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  themeKey === t.key
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <div
                  className="mb-2 h-2 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})` }}
                />
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-slate-400">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-300">Avatar</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {avatars.map((avatar) => (
            <button
              key={avatar.key}
              type="button"
              onClick={() => setAvatarBase(avatar.key)}
              className={`rounded-2xl border p-4 text-center transition-all ${
                avatarBase === avatar.key
                  ? "border-violet-500 bg-violet-500/20"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="text-3xl">{avatar.emoji}</div>
              <p className="mt-1 text-xs">{avatar.name}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading || !name.trim()} className="w-full">
        {loading ? "Guardando..." : "Guardar personaje"}
      </Button>
    </div>
  );
}
