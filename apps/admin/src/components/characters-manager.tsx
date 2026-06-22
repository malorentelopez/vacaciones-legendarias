"use client";

import { useState } from "react";
import { Card, Badge, Button, Progress } from "@repo/ui";
import { createCharacter, getCharacterDetail, checkPinAvailable } from "@/actions/admin";
import { THEME_LIST, getTheme, getAvatarEmoji } from "@repo/domain";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { Gem, Star, Zap, Trophy, Target } from "lucide-react";

interface Character {
  id: string;
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
  level: number;
  xp: number;
  crystals: number;
  weeklyPoints: number;
  xpProgress?: { progress: number; xpInLevel: number; xpNeeded: number };
  skills?: { skill: { name: string; icon: string; color: string }; level: number; xp: number }[];
}

const GENDER_OPTIONS = [
  { value: "BOY" as const, label: "Chico", icon: "👦" },
  { value: "GIRL" as const, label: "Chica", icon: "👧" },
];

function CharacterAvatar({ character, size = "lg" }: { character: Character; size?: "lg" | "xl" }) {
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const emoji = getAvatarEmoji(character.themeKey, genderKey, character.avatarBase);
  const theme = getTheme(character.themeKey);
  const sizeClass = size === "xl" ? "h-24 w-24 text-5xl" : "h-16 w-16 text-3xl";

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-2xl`}
      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.secondary}30)` }}
    >
      {emoji}
    </div>
  );
}

export function CharactersManager({ characters: initial }: { characters: Character[] }) {
  const [characters, setCharacters] = useState(initial);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<(Character & { completedMissions?: number; achievements?: number; recentEvents?: { type: string; createdAt: Date }[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [gender, setGender] = useState<"BOY" | "GIRL">("GIRL");
  const [themeKey, setThemeKey] = useState("adventure");
  const [formError, setFormError] = useState("");

  function resetCreateForm() {
    setName("");
    setPin("");
    setPinError("");
    setGender("GIRL");
    setThemeKey("adventure");
    setFormError("");
  }

  async function handlePinBlur() {
    if (pin.length !== 4) return;
    const result = await checkPinAvailable(pin);
    setPinError(result.available ? "" : "Este PIN ya está en uso");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (pin.length !== 4) {
      setPinError("El PIN debe tener 4 dígitos");
      return;
    }
    setLoading(true);
    const result = await createCharacter({ name, pin, gender, themeKey });
    if (!result.success) {
      setFormError(result.error);
      if (result.error.includes("PIN")) setPinError(result.error);
      setLoading(false);
      return;
    }
    setCharacters([...characters, result.character]);
    setCreateOpen(false);
    resetCreateForm();
    setLoading(false);
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const data = await getCharacterDetail(id);
      setDetail(data);
    } catch {
      setDetail(null);
    }
    setDetailLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personajes"
        description="Gestiona los jugadores de la familia. Cada uno necesita un PIN único de 4 dígitos."
        actionLabel="Nuevo personaje"
        onAction={() => { resetCreateForm(); setCreateOpen(true); }}
      />

      {characters.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 text-5xl">🎮</div>
          <p className="text-slate-400">Aún no hay personajes. Crea el primero.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>Crear personaje</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {characters.map((c) => {
            const theme = getTheme(c.themeKey);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => openDetail(c.id)}
                className="text-left"
              >
                <Card className="overflow-hidden transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5">
                  <div
                    className="h-2"
                    style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                  />
                  <div className="flex items-center gap-4 p-5">
                    <CharacterAvatar character={c} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold">{c.name}</h3>
                      <p className="text-sm text-slate-400">{theme.name}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="info">Nv. {c.level}</Badge>
                        <Badge variant="warning">💎 {c.crystals}</Badge>
                      </div>
                    </div>
                  </div>
                  {c.xpProgress && (
                    <div className="px-5 pb-4">
                      <Progress value={c.xpProgress.progress} className="h-1.5" />
                    </div>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo personaje"
        description="El PIN identifica al jugador al entrar en la app."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Nombre" htmlFor="char-name" required>
            <input
              id="char-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ej: Lucía"
              required
            />
          </FormField>

          <FormField
            label="PIN de acceso"
            htmlFor="char-pin"
            required
            hint="4 dígitos únicos. Lo usará para entrar en la app del jugador."
            error={pinError}
          >
            <input
              id="char-pin"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onBlur={handlePinBlur}
              className={inputClass}
              inputMode="numeric"
              placeholder="••••"
              maxLength={4}
              required
            />
          </FormField>

          <FormField label="Sexo" required>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm ${
                    gender === opt.value
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Tema visual" htmlFor="char-theme" required>
            <select
              id="char-theme"
              value={themeKey}
              onChange={(e) => setThemeKey(e.target.value)}
              className={selectClass}
            >
              {THEME_LIST.map((t) => (
                <option key={t.key} value={t.key}>{t.name} — {t.description}</option>
              ))}
            </select>
          </FormField>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !!pinError}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetail(null); }}
        title={detail?.name ?? "Personaje"}
        size="lg"
      >
        {detailLoading ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : detail ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <CharacterAvatar character={detail} size="xl" />
              <div>
                <p className="text-slate-400">{getTheme(detail.themeKey).name}</p>
                <p className="text-sm text-slate-500">
                  {detail.gender === "BOY" ? "Chico" : "Chica"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Star, label: "Nivel", value: detail.level, color: "text-violet-400" },
                { icon: Zap, label: "XP", value: detail.xp, color: "text-amber-400" },
                { icon: Gem, label: "Cristales", value: detail.crystals, color: "text-cyan-400" },
                { icon: Target, label: "Pts semana", value: detail.weeklyPoints, color: "text-emerald-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-slate-800/50 p-3 text-center">
                  <Icon className={`mx-auto h-5 w-5 ${color}`} />
                  <p className="mt-1 text-lg font-bold">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {detail.xpProgress && (
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-400">Progreso al nivel {detail.level + 1}</span>
                  <span>{detail.xpProgress.xpInLevel}/{detail.xpProgress.xpNeeded} XP</span>
                </div>
                <Progress value={detail.xpProgress.progress} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-800/50 p-3">
                <p className="text-2xl font-bold">{detail.completedMissions ?? 0}</p>
                <p className="text-xs text-slate-500">Misiones completadas</p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-3">
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  {detail.achievements ?? 0}
                </p>
                <p className="text-xs text-slate-500">Logros desbloqueados</p>
              </div>
            </div>

            {detail.skills && detail.skills.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-300">Habilidades</h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {detail.skills.map((s, i) => (
                    <div key={i} className="rounded-lg bg-slate-800/50 p-2 text-center text-sm">
                      <p className="font-medium">{s.skill.name}</p>
                      <p className="text-xs text-slate-500">Nv. {s.level} · {s.xp} XP</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-red-400 py-8">No se pudo cargar el personaje</p>
        )}
      </Modal>
    </div>
  );
}
