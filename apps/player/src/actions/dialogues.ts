"use server";

import { revalidatePath } from "next/cache";
import { CharacterService, mergeAvatarConfig, parseAvatarConfig } from "@repo/domain";
import { requirePlayerSession } from "@/lib/player-session";

const characterService = new CharacterService();

export async function markDialogueSeen(dialogueKey: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) {
    return { success: false as const, error: "Sin personaje seleccionado" };
  }

  const character = await characterService.getCharacter(session.characterId);
  const current = parseAvatarConfig(character.avatarConfig);

  if (current.dialoguesSeen?.[dialogueKey]) {
    return { success: true as const };
  }

  await characterService.updateCharacter(session.characterId, {
    avatarConfig: mergeAvatarConfig(current, {
      dialoguesSeen: { [dialogueKey]: true },
    }),
  });

  revalidatePath("/");
  revalidatePath("/ruta");

  return { success: true as const };
}
