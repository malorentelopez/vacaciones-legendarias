"use client";

import { useState } from "react";
import { Card, Button, Badge, CharacterPortrait } from "@repo/ui";
import { updateAvatar } from "@/actions/game";
import { THEME_LIST, getTheme, getThemeRoles, normalizeRoleKey, getRoleName } from "@repo/domain";
import { useRouter } from "next/navigation";

interface CharacterProfile {
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
}

const GENDER_OPTIONS: { value: "BOY" | "GIRL"; label: string }[] = [
  { value: "BOY", label: "Chico" },
  { value: "GIRL", label: "Chica" },
];

export function AvatarCustomizer({ character }: { character: CharacterProfile }) {
  const router = useRouter();
  const [name, setName] = useState(character.name);
  const [gender, setGender] = useState<"BOY" | "GIRL">(character.gender);
  const [themeKey, setThemeKey] = useState(character.themeKey);
  const [avatarBase, setAvatarBase] = useState(normalizeRoleKey(character.themeKey, character.avatarBase));
  const [loading, setLoading] = useState(false);

  const genderKey = gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(themeKey);
  const roles = getThemeRoles(themeKey);
  const roleKey = normalizeRoleKey(themeKey, avatarBase);
  const roleName = getRoleName(themeKey, genderKey, roleKey);

  function handleThemeChange(newThemeKey: string) {
    setThemeKey(newThemeKey);
    const normalized = normalizeRoleKey(newThemeKey, avatarBase);
    const newRoles = getThemeRoles(newThemeKey);
    if (!newRoles.some((r) => r.key === normalized)) {
      setAvatarBase(newRoles[0]?.key ?? "warrior");
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
        <CharacterPortrait
          roleKey={roleKey}
          gender={genderKey}
          primaryColor={theme.colors.primary}
          secondaryColor={theme.colors.secondary}
          size="xl"
          className="mx-auto mb-4"
        />
        <p className="text-lg" style={{ color: theme.colors.heading }}>
          {name || "Sin nombre"}
        </p>
        <p className="text-sm text-slate-400">{roleName}</p>
        <Badge className="mt-2">{theme.name}</Badge>
      </Card>

      <Card className="space-y-4 p-4">
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
                onClick={() => setGender(opt.value)}
                className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                  gender === opt.value
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <p className="text-sm font-medium">{opt.label}</p>
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
        <h2 className="mb-1 text-lg font-semibold text-slate-300">Rol del personaje</h2>
        <p className="mb-3 text-sm text-slate-500">El aspecto y nombre se adaptan al sexo elegido.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {roles.map((role) => {
            const name = genderKey === "boy" ? role.boy.name : role.girl.name;
            return (
              <button
                key={role.key}
                type="button"
                onClick={() => setAvatarBase(role.key)}
                className={`rounded-2xl border p-3 text-center transition-all ${
                  roleKey === role.key
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <CharacterPortrait
                  roleKey={role.key}
                  gender={genderKey}
                  primaryColor={theme.colors.primary}
                  secondaryColor={theme.colors.secondary}
                  size="sm"
                  className="mx-auto"
                />
                <p className="mt-2 text-xs leading-tight">{name}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading || !name.trim()} className="w-full">
        {loading ? "Guardando..." : "Guardar personaje"}
      </Button>
    </div>
  );
}
