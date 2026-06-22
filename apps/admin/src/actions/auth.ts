"use server";

import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginParent(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { success: false, error: "Credenciales incorrectas" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { success: false, error: "Credenciales incorrectas" };
  if (user.role !== "PARENT") return { success: false, error: "Acceso solo para padres" };

  await createSession({
    userId: user.id,
    role: user.role,
    familyId: user.familyId,
    name: user.name,
  });

  return { success: true };
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
