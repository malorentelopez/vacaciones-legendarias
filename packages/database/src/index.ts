import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeonHTTP(getDatabaseUrl(), {});

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "@prisma/client";
