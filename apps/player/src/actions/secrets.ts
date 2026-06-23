"use server";

import { revalidatePath } from "next/cache";
import { SecretService } from "@repo/domain";
import { requirePlayerSession } from "@/lib/player-session";

const secretService = new SecretService();

function revalidateSecretPaths() {
  revalidatePath("/");
  revalidatePath("/avatar");
  revalidatePath("/achievements");
}

export async function getDragonChestStatus() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return secretService.getDragonChestStatus(session.characterId);
}

export async function discoverDragonChest() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.discoverDragonChest(session.characterId);
  revalidateSecretPaths();
  revalidatePath("/secreto/cofre-dragon");
  return result;
}

export async function completeDragonChest(metadata: { memoryTurns: number; rhythmScore: number }) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.completeDragonChest(session.characterId, metadata);
  revalidateSecretPaths();
  revalidatePath("/secreto/cofre-dragon");
  return result;
}

export async function getMangaPowerComboStatus() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return secretService.getMangaPowerComboStatus(session.characterId);
}

export async function discoverMangaPowerCombo() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.discoverMangaPowerCombo(session.characterId);
  revalidateSecretPaths();
  revalidatePath("/secreto/combo-poder");
  return result;
}

export async function completeMangaPowerCombo(metadata: { sequenceScore: number }) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.completeMangaPowerCombo(session.characterId, metadata);
  revalidateSecretPaths();
  revalidatePath("/secreto/combo-poder");
  return result;
}

export async function getOceanFishingStatus() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return secretService.getOceanFishingStatus(session.characterId);
}

export async function discoverOceanFishing() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.discoverOceanFishing(session.characterId);
  revalidateSecretPaths();
  revalidatePath("/secreto/pesca-relampago");
  return result;
}

export async function completeOceanFishing(metadata: { fishCaught: number }) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await secretService.completeOceanFishing(session.characterId, metadata);
  revalidateSecretPaths();
  revalidatePath("/secreto/pesca-relampago");
  return result;
}
