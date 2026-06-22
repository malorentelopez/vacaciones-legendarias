"use client";

import { useRef, useState } from "react";
import { Card, Button, Badge, CharacterPortrait } from "@repo/ui";
import { updateAvatar } from "@/actions/game";
import { uploadCustomAvatar, removeCustomAvatar, setAvatarMode } from "@/actions/avatar";
import {
  THEME_LIST,
  getTheme,
  getThemeRoles,
  normalizeRoleKey,
  getRoleName,
  getRoleImage,
  getCharacterPortraitSrc,
  parseAvatarConfig,
  hasCustomAvatar,
} from "@repo/domain/client";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Shield, ImageIcon } from "lucide-react";

interface CharacterProfile {
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
  avatarConfig?: unknown;
}

const GENDER_OPTIONS: { value: "BOY" | "GIRL"; label: string }[] = [
  { value: "BOY", label: "Chico" },
  { value: "GIRL", label: "Chica" },
];

export function AvatarCustomizer({ character }: { character: CharacterProfile }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialConfig = parseAvatarConfig(character.avatarConfig);

  const [name, setName] = useState(character.name);
  const [gender, setGender] = useState<"BOY" | "GIRL">(character.gender);
  const [themeKey, setThemeKey] = useState(character.themeKey);
  const [avatarBase, setAvatarBase] = useState(normalizeRoleKey(character.themeKey, character.avatarBase));
  const [avatarConfig, setAvatarConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const genderKey = gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(themeKey);
  const roles = getThemeRoles(themeKey);
  const roleKey = normalizeRoleKey(themeKey, avatarBase);
  const roleName = getRoleName(themeKey, genderKey, roleKey);

  const previewCharacter = { themeKey, gender, avatarBase, avatarConfig };
  const portraitSrc = getCharacterPortraitSrc(previewCharacter);
  const customAvailable = hasCustomAvatar({ avatarConfig });

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
    await updateAvatar({
      name,
      gender,
      themeKey,
      avatarBase,
      avatarConfig: { ...avatarConfig, base: avatarBase },
    });
    router.refresh();
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadCustomAvatar(formData);
    if (result.success) {
      setAvatarConfig({ ...avatarConfig, customImage: result.customImage, useCustom: true });
      router.refresh();
    } else {
      setUploadError(result.error);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemoveCustom() {
    setUploading(true);
    const result = await removeCustomAvatar();
    if (result.success) {
      setAvatarConfig({ ...avatarConfig, customImage: null, useCustom: false });
      router.refresh();
    }
    setUploading(false);
  }

  async function handleModeChange(mode: "custom" | "role") {
    setUploading(true);
    const result = await setAvatarMode(mode);
    if (result.success) {
      setAvatarConfig({ ...avatarConfig, useCustom: mode === "custom" });
      router.refresh();
    } else if (result.error) {
      setUploadError(result.error);
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Personalización</p>
        <h1 className="text-3xl font-bold" style={{ color: theme.colors.heading }}>
          Tu héroe
        </h1>
      </div>

      <Card className="p-8 text-center">
        <CharacterPortrait
          imageSrc={portraitSrc}
          alt={roleName}
          primaryColor={theme.colors.primary}
          secondaryColor={theme.colors.secondary}
          size="xl"
          className="mx-auto mb-4 ring-2 ring-violet-500/30"
        />
        <p className="text-lg" style={{ color: theme.colors.heading }}>
          {name || "Sin nombre"}
        </p>
        <p className="text-sm text-slate-400">{avatarConfig.useCustom ? "Avatar personalizado" : roleName}</p>
        <Badge className="mt-2">{theme.name}</Badge>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-violet-400" />
          <h2 className="font-semibold text-white">Avatar propio</h2>
        </div>
        <p className="text-sm text-slate-400">
          Sube tu foto o dibujo para usarlo como retrato de héroe (JPG, PNG o WebP, máx. 2 MB).
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {uploading ? "Subiendo..." : "Subir imagen"}
          </Button>

          {customAvailable && (
            <>
              <Button
                type="button"
                variant={avatarConfig.useCustom ? "default" : "secondary"}
                disabled={uploading}
                onClick={() => handleModeChange("custom")}
              >
                Usar propio
              </Button>
              <Button
                type="button"
                variant={!avatarConfig.useCustom ? "default" : "secondary"}
                disabled={uploading}
                onClick={() => handleModeChange("role")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Usar rol
              </Button>
              <Button type="button" variant="ghost" disabled={uploading} onClick={handleRemoveCustom}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
        </div>

        {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
      </Card>

      <Card className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Nombre del héroe</label>
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
          <label className="mb-2 block text-sm text-slate-400">Mundo</label>
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
        <h2 className="mb-1 text-lg font-semibold text-slate-300">Rol del héroe</h2>
        <p className="mb-3 text-sm text-slate-500">Elige un arquetipo si no usas avatar propio.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {roles.map((role) => {
            const roleLabel = genderKey === "boy" ? role.boy.name : role.girl.name;
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
                  imageSrc={getRoleImage(themeKey, genderKey, role.key)}
                  alt={roleLabel}
                  primaryColor={theme.colors.primary}
                  secondaryColor={theme.colors.secondary}
                  size="sm"
                  className="mx-auto"
                />
                <p className="mt-2 text-xs leading-tight">{roleLabel}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading || !name.trim()} className="w-full">
        {loading ? "Guardando..." : "Guardar héroe"}
      </Button>
    </div>
  );
}
