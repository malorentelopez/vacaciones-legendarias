import { prisma } from "@repo/database/prisma";

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

  async findByFamilyForDashboard(familyId: string) {
    return prisma.character.findMany({
      where: { familyId },
      select: {
        id: true,
        name: true,
        gender: true,
        themeKey: true,
        avatarBase: true,
        avatarConfig: true,
        level: true,
        crystals: true,
        weeklyPoints: true,
        xp: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async isPinTaken(pin: string, excludeCharacterId?: string) {
    const characters = await prisma.character.findMany({
      where: {
        pin: { not: null },
        ...(excludeCharacterId ? { id: { not: excludeCharacterId } } : {}),
      },
      select: { id: true, pin: true },
    });

    const bcrypt = await import("bcryptjs");
    for (const character of characters) {
      if (character.pin && (await bcrypt.compare(pin, character.pin))) {
        return true;
      }
    }
    return false;
  }

  async findByPinGlobal(pin: string) {
    const characters = await prisma.character.findMany({
      where: { pin: { not: null } },
      include: { user: true },
    });

    const bcrypt = await import("bcryptjs");
    for (const character of characters) {
      if (character.pin && (await bcrypt.compare(pin, character.pin))) {
        return character;
      }
    }
    return null;
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
    gender?: "BOY" | "GIRL";
    themeKey?: string;
  }) {
    const skills = await prisma.skill.findMany();
    const gender = data.gender ?? "GIRL";
    const themeKey = data.themeKey ?? "adventure";
    const theme = await import("../config/themes").then((m) => m.getTheme(themeKey));
    const defaultAvatar = theme.roles[0]?.key ?? "warrior";

    return prisma.character.create({
      data: {
        name: data.name,
        familyId: data.familyId,
        userId: data.userId,
        pin: data.pin,
        gender,
        themeKey,
        avatarBase: data.avatarBase ?? defaultAvatar,
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
      gender: "BOY" | "GIRL";
      themeKey: string;
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

  async delete(id: string) {
    return prisma.character.delete({
      where: { id },
    });
  }

  async updateSkillXp(characterSkillId: string, xp: number, level: number) {
    return prisma.characterSkill.update({
      where: { id: characterSkillId },
      data: { xp, level },
    });
  }

  async resetProgress(characterId: string, avatarConfig: object) {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { skills: true },
    });
    if (!character) throw new Error("Personaje no encontrado");

    await prisma.$transaction([
      prisma.missionProgress.deleteMany({ where: { characterId } }),
      prisma.characterAchievement.deleteMany({ where: { characterId } }),
      prisma.rewardPurchase.deleteMany({ where: { characterId } }),
      prisma.penalty.deleteMany({ where: { characterId } }),
      prisma.weeklyPenalty.deleteMany({ where: { characterId } }),
      prisma.crystalTransaction.deleteMany({ where: { characterId } }),
      prisma.gameEvent.deleteMany({ where: { characterId } }),
      prisma.questionnaireSubmission.deleteMany({ where: { characterId } }),
      ...character.skills.map((skill) =>
        prisma.characterSkill.update({
          where: { id: skill.id },
          data: { xp: 0, level: 1 },
        })
      ),
      prisma.character.update({
        where: { id: characterId },
        data: {
          level: 1,
          xp: 0,
          crystals: 0,
          weeklyPoints: 0,
          avatarConfig,
        },
      }),
    ]);
  }
}
