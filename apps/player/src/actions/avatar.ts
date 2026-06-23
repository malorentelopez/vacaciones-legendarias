"use server";

import { revalidatePath } from "next/cache";
import { CharacterService, parseAvatarConfig, mergeAvatarConfig, getUnlockedAccessoryKeys, getUnlockedPetKeys } from "@repo/domain";
import { requirePlayerSession } from "@/lib/player-session";
import { removeStoredAvatar, storeAvatarImage } from "@/lib/avatar-storage";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const characterService = new CharacterService();

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

  const character = await characterService.getCharacter(characterId);
  const current = parseAvatarConfig(character.avatarConfig);

  await removeStoredAvatar(characterId, current.customImage);

  const buffer = Buffer.from(await file.arrayBuffer());
  const customImage = await storeAvatarImage(characterId, ext, buffer, file.type);

  await characterService.updateCharacter(characterId, {
    avatarConfig: {
      ...current,
      customImage,
      useCustom: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/avatar");
  revalidatePath("/ruta");

  return { success: true as const, customImage };
}

export async function removeCustomAvatar() {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  const character = await characterService.getCharacter(session.characterId);
  const current = parseAvatarConfig(character.avatarConfig);

  await removeStoredAvatar(session.characterId, current.customImage);

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

  return { success: true as const };
}

export async function equipHat(hatKey: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  const character = await characterService.getCharacter(session.characterId);
  const config = parseAvatarConfig(character.avatarConfig);
  const unlocked = getUnlockedAccessoryKeys(character.avatarConfig, {
    level: character.level,
    secretCompleted: !!config.secrets?.["dragon-chest"]?.completedAt,
    streakCurrent: config.streak?.current ?? 0,
  });

  if (!unlocked.includes(hatKey)) {
    return { success: false as const, error: "Aún no has desbloqueado este accesorio" };
  }

  const current = parseAvatarConfig(character.avatarConfig);
  await characterService.updateCharacter(session.characterId, {
    avatarConfig: mergeAvatarConfig(current, {
      equipped: { ...current.equipped, hat: hatKey },
    }),
  });

  revalidatePath("/");
  revalidatePath("/avatar");

  return { success: true as const };
}

export async function equipPet(petKey: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  const character = await characterService.getCharacter(session.characterId);
  const config = parseAvatarConfig(character.avatarConfig);
  const unlocked = getUnlockedPetKeys(character.avatarConfig, {
    level: character.level,
    secretCompleted: !!config.secrets?.["dragon-chest"]?.completedAt,
    streakCurrent: config.streak?.current ?? 0,
  });

  if (!unlocked.includes(petKey)) {
    return { success: false as const, error: "Aún no has desbloqueado este compañero" };
  }

  const current = parseAvatarConfig(character.avatarConfig);
  await characterService.updateCharacter(session.characterId, {
    avatarConfig: mergeAvatarConfig(current, {
      equipped: { ...current.equipped, pet: petKey },
    }),
  });

  revalidatePath("/");
  revalidatePath("/avatar");

  return { success: true as const };
}
