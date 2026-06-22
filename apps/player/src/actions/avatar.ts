"use server";

import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { CharacterService, parseAvatarConfig } from "@repo/domain";
import { requirePlayerSession } from "@/lib/player-session";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const characterService = new CharacterService();

function customAvatarDir() {
  return path.join(process.cwd(), "public/avatars/custom");
}

function customAvatarPath(characterId: string, ext: string) {
  return path.join(customAvatarDir(), `${characterId}.${ext}`);
}

function customAvatarUrl(characterId: string, ext: string) {
  return `/avatars/custom/${characterId}.${ext}`;
}

async function removeExistingCustomFiles(characterId: string) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    try {
      await unlink(customAvatarPath(characterId, ext));
    } catch {
      // file may not exist
    }
  }
}

export async function uploadCustomAvatar(formData: FormData) {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, error: "Selecciona una imagen" };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { success: false as const, error: "Formato no válido. Usa JPG, PNG o WebP." };
  }
  if (file.size > MAX_SIZE) {
    return { success: false as const, error: "La imagen pesa demasiado (máx. 2 MB)." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const characterId = session.characterId;

  await mkdir(customAvatarDir(), { recursive: true });
  await removeExistingCustomFiles(characterId);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(customAvatarPath(characterId, ext), buffer);

  const character = await characterService.getCharacter(characterId);
  const current = parseAvatarConfig(character.avatarConfig);

  await characterService.updateCharacter(characterId, {
    avatarConfig: {
      ...current,
      customImage: customAvatarUrl(characterId, ext),
      useCustom: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/avatar");
  revalidatePath("/ruta");

  return { success: true as const, customImage: customAvatarUrl(characterId, ext) };
}

export async function removeCustomAvatar() {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  await removeExistingCustomFiles(session.characterId);

  const character = await characterService.getCharacter(session.characterId);
  const current = parseAvatarConfig(character.avatarConfig);

  await characterService.updateCharacter(session.characterId, {
    avatarConfig: {
      ...current,
      customImage: null,
      useCustom: false,
    },
  });

  revalidatePath("/");
  revalidatePath("/avatar");
  revalidatePath("/ruta");

  return { success: true as const };
}

export async function setAvatarMode(mode: "custom" | "role") {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  const character = await characterService.getCharacter(session.characterId);
  const current = parseAvatarConfig(character.avatarConfig);

  if (mode === "custom" && !current.customImage) {
    return { success: false as const, error: "Sube una imagen primero" };
  }

  await characterService.updateCharacter(session.characterId, {
    avatarConfig: {
      ...current,
      useCustom: mode === "custom",
    },
  });

  revalidatePath("/");
  revalidatePath("/avatar");

  return { success: true as const };
}
