import { prisma } from "@repo/database";

export class CharacterRepository {
  async findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        user: true,
      },
    });
  }

  async findByFamily(familyId: string) {
    return prisma.character.findMany({
      where: { familyId },
      include: {
        skills: { include: { skill: true } },
        user: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByPin(familyId: string, pin: string) {
    const characters = await prisma.character.findMany({
      where: { familyId },
      include: { user: true },
    });

    for (const character of characters) {
      if (character.pin) {
        const bcrypt = await import("bcryptjs");
        const match = await bcrypt.compare(pin, character.pin);
        if (match) return character;
      }
    }
    return null;
  }

  async create(data: {
    name: string;
    familyId: string;
    userId?: string;
    pin?: string;
    avatarBase?: string;
  }) {
    const skills = await prisma.skill.findMany();

    return prisma.character.create({
      data: {
        name: data.name,
        familyId: data.familyId,
        userId: data.userId,
        pin: data.pin,
        avatarBase: data.avatarBase ?? "default",
        skills: {
          create: skills.map((skill) => ({
            skillId: skill.id,
            xp: 0,
            level: 1,
          })),
        },
      },
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      level: number;
      xp: number;
      crystals: number;
      weeklyPoints: number;
      avatarBase: string;
      avatarConfig: object;
      pin: string;
    }>
  ) {
    return prisma.character.update({
      where: { id },
      data,
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async updateSkillXp(characterSkillId: string, xp: number, level: number) {
    return prisma.characterSkill.update({
      where: { id: characterSkillId },
      data: { xp, level },
    });
  }
}
