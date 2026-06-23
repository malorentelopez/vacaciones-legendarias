"use server";

import { revalidatePath } from "next/cache";
import { SecretService } from "@repo/domain";
import { requirePlayerSession } from "@/lib/player-session";

const secretService = new SecretService();

export async function getDragonChestStatus() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return secretService.getDragonChestStatus(session.characterId);
}

export async function discoverDragonChest() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.discoverDragonChest(session.characterId);
  revalidatePath("/");
  revalidatePath("/secreto/cofre-dragon");
  return result;
}

export async function completeDragonChest(metadata: { memoryTurns: number; rhythmScore: number }) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.completeDragonChest(session.characterId, metadata);
  revalidatePath("/");
  revalidatePath("/achievements");
  revalidatePath("/avatar");
  revalidatePath("/secreto/cofre-dragon");
  return result;
}
