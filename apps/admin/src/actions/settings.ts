"use server";

import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireSession, createSession } from "@/lib/auth";

export async function getAccountProfile() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new Error("Usuario no encontrado");

  return {
    name: user.name,
    email: user.email ?? "",
  };
}

export async function updateAccountProfile(data: { name: string; email: string }) {
  const session = await requireSession();
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();

  if (!name) {
    return { success: false as const, error: "El nombre es obligatorio" };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false as const, error: "Introduce un email válido" };
  }

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: session.userId } },
  });
  if (existing) {
    return { success: false as const, error: "Ese email ya está en uso" };
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, email },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    familyId: user.familyId,
    name: user.name,
  });

  revalidatePath("/", "layout");
  return { success: true as const };
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.passwordHash) {
    return { success: false as const, error: "No se puede cambiar la contraseña" };
  }

  if (data.newPassword.length < 6) {
    return { success: false as const, error: "La nueva contraseña debe tener al menos 6 caracteres" };
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false as const, error: "La contraseña actual no es correcta" };
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  });

  return { success: true as const };
}
