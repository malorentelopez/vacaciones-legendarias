import { CharacterRepository } from "../repositories/character.repository";
import { ConfigurationRepository } from "../repositories/skill.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import { prisma } from "@repo/database";
import { getWeekKey } from "../utils/period";

export class WeeklyPointsService {
  constructor(
    private characterRepo = new CharacterRepository(),
    private configRepo = new ConfigurationRepository(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async calculateScreenTime(weeklyPoints: number) {
    const configs = await this.configRepo.getScreenTimeConfigs();
    const match = configs.find(
      (c) => weeklyPoints >= c.minWeeklyPoints && weeklyPoints <= c.maxWeeklyPoints
    );
    return match?.minutesAllowed ?? 30;
  }

  async applyPenalty(characterId: string, points: number, reason?: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const weekKey = getWeekKey();
    const newWeeklyPoints = Math.max(0, character.weeklyPoints - points);

    await this.characterRepo.update(characterId, { weeklyPoints: newWeeklyPoints });

    await prisma.penalty.create({
      data: { characterId, type: "POINTS_DEDUCTION", points, reason },
    });

    await prisma.weeklyPenalty.upsert({
      where: { characterId_weekKey: { characterId, weekKey } },
      update: { points: { increment: points }, reason },
      create: { characterId, weekKey, points, reason },
    });

    await this.gameEventRepo.create(characterId, "PENALTY_APPLIED", { points, reason });
  }

  async resetWeeklyPoints(familyId: string) {
    const characters = await this.characterRepo.findByFamily(familyId);

    for (const character of characters) {
      await this.characterRepo.update(character.id, { weeklyPoints: 0 });
      await this.gameEventRepo.create(character.id, "WEEKLY_RESET", {});
    }
  }

  async getFamilyWeeklyStats(familyId: string) {
    const characters = await this.characterRepo.findByFamily(familyId);

    return Promise.all(
      characters.map(async (character) => ({
        characterId: character.id,
        name: character.name,
        weeklyPoints: character.weeklyPoints,
        screenTimeMinutes: await this.calculateScreenTime(character.weeklyPoints),
      }))
    );
  }
}
