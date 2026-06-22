import { AchievementRepository } from "../repositories/achievement.repository";
import { CharacterRepository } from "../repositories/character.repository";
import { CharacterService } from "./character.service";
import { GameEventRepository } from "../repositories/game-event.repository";
import { prisma } from "@repo/database";

export class AchievementService {
  constructor(
    private achievementRepo = new AchievementRepository(),
    private characterRepo = new CharacterRepository(),
    private characterService = new CharacterService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getAchievements(familyId?: string) {
    return this.achievementRepo.findAll(familyId);
  }

  async getCharacterAchievements(characterId: string, familyId?: string) {
    const all = await this.achievementRepo.findAll(familyId);
    const unlocked = await this.achievementRepo.getCharacterAchievements(characterId);
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

    const completedMissionIds = new Set(
      (
        await prisma.missionProgress.findMany({
          where: { characterId, completed: true },
          select: { missionId: true },
        })
      ).map((p) => p.missionId)
    );

    return all.map((achievement) => {
      const requiredMissionIds = achievement.missions.map((m) => m.missionId);
      const completedRequired = requiredMissionIds.filter((id) =>
        completedMissionIds.has(id)
      ).length;

      return {
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlockedAt: unlocked.find((u) => u.achievementId === achievement.id)?.unlockedAt,
        progress:
          requiredMissionIds.length > 0
            ? { completed: completedRequired, total: requiredMissionIds.length }
            : undefined,
      };
    });
  }

  async createAchievement(data: Parameters<AchievementRepository["create"]>[0]) {
    return this.achievementRepo.create(data);
  }

  async updateAchievement(id: string, data: Parameters<AchievementRepository["update"]>[1]) {
    return this.achievementRepo.update(id, data);
  }

  async deleteAchievement(id: string) {
    return this.achievementRepo.delete(id);
  }

  private async hasCompletedRequiredMissions(
    characterId: string,
    missionIds: string[]
  ): Promise<boolean> {
    if (missionIds.length === 0) return true;

    const completed = await prisma.missionProgress.findMany({
      where: { characterId, missionId: { in: missionIds }, completed: true },
      select: { missionId: true },
      distinct: ["missionId"],
    });

    return completed.length >= missionIds.length;
  }

  async evaluateAchievements(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) return [];

    const achievements = await this.achievementRepo.findAll(character.familyId);
    const newlyUnlocked = [];

    const completedMissionsCount = await prisma.missionProgress.count({
      where: { characterId, completed: true },
    });

    for (const achievement of achievements) {
      const isUnlocked = await this.achievementRepo.isUnlocked(characterId, achievement.id);
      if (isUnlocked) continue;

      let qualifies = true;
      const requiredMissionIds = achievement.missions.map((m) => m.missionId);

      if (requiredMissionIds.length > 0) {
        qualifies = await this.hasCompletedRequiredMissions(characterId, requiredMissionIds);
      } else if (achievement.requiredMissions) {
        qualifies = completedMissionsCount >= achievement.requiredMissions;
      }

      if (achievement.requiredLevel && character.level < achievement.requiredLevel) {
        qualifies = false;
      }

      if (achievement.requiredSkillId && achievement.requiredSkillXp) {
        const skill = character.skills.find((s) => s.skillId === achievement.requiredSkillId);
        if (!skill || skill.xp < achievement.requiredSkillXp) {
          qualifies = false;
        }
      }

      if (qualifies) {
        const unlocked = await this.achievementRepo.unlock(characterId, achievement.id);
        await this.gameEventRepo.create(characterId, "ACHIEVEMENT_UNLOCKED", {
          achievementId: achievement.id,
          title: achievement.title,
        });

        if (achievement.crystalReward > 0) {
          await this.characterService.addCrystals(
            characterId,
            achievement.crystalReward,
            `Logro desbloqueado: ${achievement.title}`
          );
        }

        newlyUnlocked.push(unlocked);
      }
    }

    return newlyUnlocked;
  }
}
