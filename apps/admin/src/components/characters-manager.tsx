"use client";

import { useState } from "react";
import { Card, Badge, Button, Progress, CharacterPortrait } from "@repo/ui";
import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacterDetail,
  checkPinAvailable,
} from "@/actions/admin";
import {
  THEME_LIST,
  getTheme,
  getThemeRoles,
  getRoleName,
  getRoleImage,
  normalizeRoleKey,
} from "@repo/domain/client";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { Gem, Star, Zap, Trophy, Target, Pencil, Trash2 } from "lucide-react";

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
  { value: "BOY" as const, label: "Chico" },
  { value: "GIRL" as const, label: "Chica" },
];

type FormMode = "create" | "edit";

function CharacterAvatarDisplay({ character, size = "lg" }: { character: Character; size?: "lg" | "xl" }) {
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(character.themeKey);
  const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);

  return (
    <CharacterPortrait
      imageSrc={getRoleImage(character.themeKey, genderKey, roleKey)}
      alt={getRoleName(character.themeKey, genderKey, roleKey)}
      primaryColor={theme.colors.primary}
      secondaryColor={theme.colors.secondary}
      size={size === "xl" ? "xl" : "lg"}
    />
  );
}

function RolePicker({
  themeKey,
  gender,
  avatarBase,
  onSelect,
}: {
  themeKey: string;
  gender: "BOY" | "GIRL";
  avatarBase: string;
  onSelect: (key: string) => void;
}) {
  const genderKey = gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(themeKey);
  const roles = getThemeRoles(themeKey);
  const normalized = normalizeRoleKey(themeKey, avatarBase);

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {roles.map((role) => {
        const name = genderKey === "boy" ? role.boy.name : role.girl.name;
        const selected = normalized === role.key;
        return (
          <button
            key={role.key}
            type="button"
            onClick={() => onSelect(role.key)}
            className={`rounded-xl border p-2 text-center transition-all ${
              selected
                ? "border-violet-500 bg-violet-500/20"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            <CharacterPortrait
              imageSrc={getRoleImage(themeKey, genderKey, role.key)}
              alt={name}
              primaryColor={theme.colors.primary}
              secondaryColor={theme.colors.secondary}
              size="sm"
              className="mx-auto"
            />
            <p className="mt-1 text-xs leading-tight">{name}</p>
          </button>
        );
      })}
    </div>
  );
}

export function CharactersManager({ characters: initial }: { characters: Character[] }) {
  const [characters, setCharacters] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detail, setDetail] = useState<(Character & { completedMissions?: number; achievements?: number }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [gender, setGender] = useState<"BOY" | "GIRL">("GIRL");
  const [themeKey, setThemeKey] = useState("adventure");
  const [avatarBase, setAvatarBase] = useState("warrior");
  const [formError, setFormError] = useState("");

  function resetForm() {
    setName("");
    setPin("");
    setPinError("");
    setGender("GIRL");
    setThemeKey("adventure");
    setAvatarBase("warrior");
    setFormError("");
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setFormMode("create");
    setFormOpen(true);
  }

  function openEdit(character: Character) {
    setFormMode("edit");
    setEditingId(character.id);
    setName(character.name);
    setPin("");
    setPinError("");
    setGender(character.gender);
    setThemeKey(character.themeKey);
    setAvatarBase(normalizeRoleKey(character.themeKey, character.avatarBase));
    setFormError("");
    setFormOpen(true);
    setDetailOpen(false);
  }

  function handleThemeChange(newTheme: string) {
    setThemeKey(newTheme);
    const roles = getThemeRoles(newTheme);
    const normalized = normalizeRoleKey(newTheme, avatarBase);
    if (!roles.some((r) => r.key === normalized)) {
      setAvatarBase(roles[0]?.key ?? "warrior");
    }
  }

  function handleGenderChange(newGender: "BOY" | "GIRL") {
    setGender(newGender);
  }

  async function handlePinBlur() {
    if (pin.length !== 4) return;
    const result = await checkPinAvailable(pin, editingId ?? undefined);
    setPinError(result.available ? "" : "Este PIN ya está en uso");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (formMode === "create") {
      if (pin.length !== 4) {
        setPinError("El PIN debe tener 4 dígitos");
        return;
      }
      setLoading(true);
      const result = await createCharacter({ name, pin, gender, themeKey, avatarBase });
      if (!result.success) {
        setFormError(result.error);
        if (result.error.includes("PIN")) setPinError(result.error);
        setLoading(false);
        return;
      }
      setCharacters([...characters, result.character]);
    } else if (editingId) {
      setLoading(true);
      const result = await updateCharacter(editingId, {
        name,
        ...(pin ? { pin } : {}),
        gender,
        themeKey,
        avatarBase,
      });
      if (!result.success) {
        setFormError(result.error);
        if (result.error.includes("PIN")) setPinError(result.error);
        setLoading(false);
        return;
      }
      setCharacters(characters.map((c) => (c.id === editingId ? { ...c, ...result.character } : c)));
    }

    setFormOpen(false);
    resetForm();
    setLoading(false);
  }

  async function handleDelete() {
    if (!detail) return;
    setLoading(true);
    const result = await deleteCharacter(detail.id);
    if (result.success) {
      setCharacters(characters.filter((c) => c.id !== detail.id));
      setDeleteOpen(false);
      setDetailOpen(false);
      setDetail(null);
    }
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
        onAction={openCreate}
      />

      {characters.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CharacterPortrait
            imageSrc={getRoleImage("adventure", "girl", "warrior")}
            alt="Aventurero"
            size="xl"
            className="mb-4 opacity-60"
          />
          <p className="text-slate-400">Aún no hay personajes. Crea el primero.</p>
          <Button className="mt-4" onClick={openCreate}>Crear personaje</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {characters.map((c) => {
            const theme = getTheme(c.themeKey);
            const roleName = getRoleName(c.themeKey, c.gender === "BOY" ? "boy" : "girl", c.avatarBase);
            return (
              <button key={c.id} type="button" onClick={() => openDetail(c.id)} className="text-left">
                <Card className="overflow-hidden transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5">
                  <div
                    className="h-2"
                    style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                  />
                  <div className="flex items-center gap-4 p-5">
                    <CharacterAvatarDisplay character={c} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold">{c.name}</h3>
                      <p className="text-sm text-slate-400">{roleName} · {theme.name}</p>
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

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); resetForm(); }}
        title={formMode === "create" ? "Nuevo personaje" : "Editar personaje"}
        description={formMode === "create" ? "El PIN identifica al jugador al entrar en la app." : "Modifica los datos del personaje."}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            label={formMode === "create" ? "PIN de acceso" : "Nuevo PIN (opcional)"}
            htmlFor="char-pin"
            required={formMode === "create"}
            hint={formMode === "edit" ? "Déjalo vacío para mantener el PIN actual." : "4 dígitos únicos."}
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
              required={formMode === "create"}
            />
          </FormField>

          <FormField label="Sexo" required>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGenderChange(opt.value)}
                  className={`rounded-xl border py-3 text-sm ${
                    gender === opt.value
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Tema visual" htmlFor="char-theme" required>
            <select
              id="char-theme"
              value={themeKey}
              onChange={(e) => handleThemeChange(e.target.value)}
              className={selectClass}
            >
              {THEME_LIST.map((t) => (
                <option key={t.key} value={t.key}>{t.name} — {t.description}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Rol del personaje" hint="El nombre y aspecto se adaptan al sexo elegido.">
            <RolePicker
              themeKey={themeKey}
              gender={gender}
              avatarBase={avatarBase}
              onSelect={setAvatarBase}
            />
          </FormField>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setFormOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !!pinError}>
              {loading ? "Guardando..." : formMode === "create" ? "Crear" : "Guardar cambios"}
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
          <p className="py-8 text-center text-slate-400">Cargando...</p>
        ) : detail ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <CharacterAvatarDisplay character={detail} size="xl" />
              <div className="flex-1">
                <p className="font-medium text-violet-300">
                  {getRoleName(detail.themeKey, detail.gender === "BOY" ? "boy" : "girl", detail.avatarBase)}
                </p>
                <p className="text-slate-400">{getTheme(detail.themeKey).name}</p>
                <p className="text-sm text-slate-500">
                  {detail.gender === "BOY" ? "Chico" : "Chica"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(detail)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
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
          </div>
        ) : (
          <p className="py-8 text-center text-red-400">No se pudo cargar el personaje</p>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar personaje"
        description={`¿Seguro que quieres eliminar a ${detail?.name}? Esta acción no se puede deshacer.`}
        size="sm"
      >
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" disabled={loading} onClick={handleDelete}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
