import { cache } from "react";
import { getSession, type SessionPayload } from "./auth";

/** Session from the signed JWT. Character selection is validated when the cookie is issued. */
export const getValidPlayerSession = cache(async (): Promise<SessionPayload | null> => {
  return getSession();
});

export async function requirePlayerSession(): Promise<SessionPayload> {
  const session = await getValidPlayerSession();
  if (!session) throw new Error("No autenticado");
  if (session.role !== "CHILD") throw new Error("Acceso denegado");
  return session;
}
