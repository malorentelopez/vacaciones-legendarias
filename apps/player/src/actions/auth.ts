"use server";

import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/auth";
import { CharacterRepository } from "@repo/domain";
import { redirect } from "next/navigation";

export async function loginWithPin(pin: string) {
  const characterRepo = new CharacterRepository();
  const character = await characterRepo.findByPinGlobal(pin);

  if (character) {
    const user = character.userId
      ? await prisma.user.findUnique({ where: { id: character.userId } })
      : null;

    await createSession({
      userId: user?.id ?? character.id,
      role: "CHILD",
      familyId: character.familyId,
      characterId: character.id,
      name: character.name,
    });
    return { success: true };
  }

  return { success: false, error: "PIN incorrecto" };
}

export async function selectCharacter(characterId: string) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) return { success: false, error: "Personaje no encontrado" };

  const session = await import("@/lib/auth").then((m) => m.getSession());
  if (!session || session.familyId !== character.familyId) {
    return { success: false, error: "Acceso denegado" };
  }

  await createSession({
    ...session,
    characterId: character.id,
    name: character.name,
  });

  return { success: true };
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
