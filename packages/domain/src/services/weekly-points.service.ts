import { CharacterRepository } from "../repositories/character.repository";
import { ConfigurationRepository, resolveScreenTimeMinutes } from "../repositories/skill.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import { RewardRepository } from "../repositories/reward.repository";
import { prisma } from "@repo/database/prisma";
import { getWeekKey } from "../utils/period";

export type PenaltyDeductionType = "POINTS_DEDUCTION" | "CRYSTAL_DEDUCTION";

export class WeeklyPointsService {
  constructor(
    private characterRepo = new CharacterRepository(),
    private configRepo = new ConfigurationRepository(),
    private gameEventRepo = new GameEventRepository(),
    private rewardRepo = new RewardRepository()
  ) {}

  async calculateScreenTime(weeklyPoints: number) {
    const configs = await this.configRepo.getScreenTimeConfigs();
    return resolveScreenTimeMinutes(weeklyPoints, configs);
  }

  async applyPenalty(
    characterId: string,
    type: PenaltyDeductionType,
    amount: number,
    reason?: string
  ) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");
    if (amount < 1) throw new Error("La cantidad debe ser al menos 1");

    const characterSelect = {
      id: true,
      name: true,
      gender: true,
      themeKey: true,
      avatarBase: true,
      level: true,
      weeklyPoints: true,
      crystals: true,
    } as const;

    if (type === "POINTS_DEDUCTION") {
      const weekKey = getWeekKey();
      const newWeeklyPoints = Math.max(0, character.weeklyPoints - amount);

      await this.characterRepo.update(characterId, { weeklyPoints: newWeeklyPoints });

      const penalty = await prisma.penalty.create({
        data: { characterId, type, points: amount, reason },
        include: { character: { select: characterSelect } },
      });

      await prisma.weeklyPenalty.upsert({
        where: { characterId_weekKey: { characterId, weekKey } },
        update: { points: { increment: amount }, reason },
        create: { characterId, weekKey, points: amount, reason },
      });

      await this.gameEventRepo.create(characterId, "PENALTY_APPLIED", {
        type,
        points: amount,
        crystals: 0,
        reason,
      });

      return { ...penalty, character: { ...penalty.character, weeklyPoints: newWeeklyPoints } };
    }

    const newCrystals = Math.max(0, character.crystals - amount);

    await this.characterRepo.update(characterId, { crystals: newCrystals });

    const penalty = await prisma.penalty.create({
      data: { characterId, type, crystals: amount, reason },
      include: { character: { select: characterSelect } },
    });

    await this.rewardRepo.addCrystalTransaction(
      characterId,
      -amount,
      reason ? `Penalización: ${reason}` : "Penalización"
    );

    await this.gameEventRepo.create(characterId, "PENALTY_APPLIED", {
      type,
      points: 0,
      crystals: amount,
      reason,
    });

    return { ...penalty, character: { ...penalty.character, crystals: newCrystals } };
  }

  async getFamilyPenalties(familyId: string, limit = 50) {
    return prisma.penalty.findMany({
      where: { character: { familyId } },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            gender: true,
            themeKey: true,
            avatarBase: true,
            level: true,
            weeklyPoints: true,
            crystals: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });
  }

  async resetWeeklyPoints(familyId: string) {
    const characters = await this.characterRepo.findByFamily(familyId);

    for (const character of characters) {
      await this.characterRepo.update(character.id, { weeklyPoints: 0 });
      await this.gameEventRepo.create(character.id, "WEEKLY_RESET", {});
    }
  }

  async getFamilyWeeklyStats(familyId: string) {
    const [characters, configs] = await Promise.all([
      this.characterRepo.findByFamilyForDashboard(familyId),
      this.configRepo.getScreenTimeConfigs(),
    ]);

    return characters.map((character) => ({
      characterId: character.id,
      name: character.name,
      weeklyPoints: character.weeklyPoints,
      screenTimeMinutes: resolveScreenTimeMinutes(character.weeklyPoints, configs),
    }));
  }
}
