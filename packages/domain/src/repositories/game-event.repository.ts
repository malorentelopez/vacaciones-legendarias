import type { EventType, Prisma } from "@repo/database";
import { prisma } from "@repo/database/prisma";

export class GameEventRepository {
  async create(
    characterId: string,
    type: EventType,
    payload: Prisma.InputJsonValue = {}
  ) {
    return prisma.gameEvent.create({
      data: { characterId, type, payload },
    });
  }

  async findByCharacter(characterId: string, limit = 50) {
    return prisma.gameEvent.findMany({
      where: { characterId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByFamily(familyId: string, limit = 100) {
    return prisma.gameEvent.findMany({
      where: { character: { familyId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { character: { select: { name: true } } },
    });
  }
}
