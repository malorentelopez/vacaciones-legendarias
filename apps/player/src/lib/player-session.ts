import { cache } from "react";
import { prisma } from "@repo/database";
import { getSession, type SessionPayload } from "./auth";

async function sanitizePlayerSession(session: SessionPayload): Promise<SessionPayload> {
  if (!session.characterId) return session;

  const character = await prisma.character.findFirst({
    where: { id: session.characterId, familyId: session.familyId },
    select: { id: true },
  });

  if (character) return session;

  const { characterId: _removed, ...rest } = session;
  return rest as SessionPayload;
}

/** Read-only: returns session ignoring a stale characterId (no cookie writes). */
export const getValidPlayerSession = cache(async (): Promise<SessionPayload | null> => {
  const session = await getSession();
  if (!session) return null;
  return sanitizePlayerSession(session);
});

export async function requirePlayerSession(): Promise<SessionPayload> {
  const session = await getValidPlayerSession();
  if (!session) throw new Error("No autenticado");
  if (session.role !== "CHILD") throw new Error("Acceso denegado");
  return session;
}
