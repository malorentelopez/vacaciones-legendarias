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
    const unlockedById = new Map(unlocked.map((u) => [u.achievementId, u]));

    const completedMissionIds = new Set(
      (
        await prisma.missionProgress.findMany({
          where: { characterId, completed: true },
          select: { missionId: true },
          distinct: ["missionId"],
        })
      ).map((p) => p.missionId)
    );

    const missionCompletionCounts = new Map<string, number>();
    const completionRows = await prisma.missionProgress.groupBy({
      by: ["missionId"],
      where: { characterId, completed: true },
      _count: { _all: true },
    });
    for (const row of completionRows) {
      missionCompletionCounts.set(row.missionId, row._count._all);
    }

    return all.map((achievement) => {
      const record = unlockedById.get(achievement.id);
      const requiredMissionIds = achievement.missions.map((m) => m.missionId);
      const completedRequired = requiredMissionIds.filter((id) =>
        completedMissionIds.has(id)
      ).length;

      let progress: { completed: number; total: number } | undefined;
      if (requiredMissionIds.length > 0) {
        progress = { completed: completedRequired, total: requiredMissionIds.length };
      } else if (achievement.targetMissionId && achievement.targetMissionCompletions) {
        progress = {
          completed: missionCompletionCounts.get(achievement.targetMissionId) ?? 0,
          total: achievement.targetMissionCompletions,
        };
      }

      const isUnlocked = !!record;
      const isClaimed = !!record?.claimedAt;

      return {
        ...achievement,
        unlocked: isUnlocked,
        claimed: isClaimed,
        claimable: isUnlocked && !isClaimed && achievement.crystalReward > 0,
        unlockedAt: record?.unlockedAt,
        claimedAt: record?.claimedAt,
        progress: achievement.isManual ? undefined : progress,
        isManual: achievement.isManual,
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

  async getAchievementUnlocks(familyId: string) {
    return this.achievementRepo.getUnlocksForFamily(familyId);
  }

  async grantAchievement(characterId: string, achievementId: string) {
    const achievement = await this.achievementRepo.findById(achievementId);
    if (!achievement) throw new Error("Logro no encontrado");
    if (!achievement.isManual) {
      throw new Error("Este logro no se puede otorgar manualmente");
    }

    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const isUnlocked = await this.achievementRepo.isUnlocked(characterId, achievementId);
    if (isUnlocked) throw new Error("El jugador ya tiene este logro");

    const unlocked = await this.achievementRepo.unlock(characterId, achievementId);

    await this.gameEventRepo.create(characterId, "ACHIEVEMENT_UNLOCKED", {
      achievementId,
      title: achievement.title,
      grantedManually: true,
    });

    return unlocked;
  }

  async claimAchievement(characterId: string, achievementId: string) {
    const record = await this.achievementRepo.claim(characterId, achievementId);

    if (record.achievement.crystalReward > 0) {
      await this.characterService.addCrystals(
        characterId,
        record.achievement.crystalReward,
        `Logro reclamado: ${record.achievement.title}`
      );
    }

    await this.gameEventRepo.create(characterId, "ACHIEVEMENT_CLAIMED", {
      achievementId,
      title: record.achievement.title,
      crystals: record.achievement.crystalReward,
    });

    return record;
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

  private async getMissionCompletionCount(characterId: string, missionId: string) {
    return prisma.missionProgress.count({
      where: { characterId, missionId, completed: true },
    });
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
      if (achievement.isManual) continue;

      const isUnlocked = await this.achievementRepo.isUnlocked(characterId, achievement.id);
      if (isUnlocked) continue;

      let qualifies = true;
      const requiredMissionIds = achievement.missions.map((m) => m.missionId);

      if (achievement.targetMissionId && achievement.targetMissionCompletions) {
        const count = await this.getMissionCompletionCount(characterId, achievement.targetMissionId);
        qualifies = count >= achievement.targetMissionCompletions;
      } else if (requiredMissionIds.length > 0) {
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
        newlyUnlocked.push(unlocked);
      }
    }

    return newlyUnlocked;
  }
}
