import { prisma } from "@repo/database";
import { DRAGON_CHEST_SECRET } from "../config/secrets";
import { CharacterRepository } from "../repositories/character.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import { CharacterService } from "./character.service";
import { mergeAvatarConfig, parseAvatarConfig } from "../utils/avatar";

export class SecretService {
  constructor(
    private characterRepo = new CharacterRepository(),
    private achievementRepo = new AchievementRepository(),
    private characterService = new CharacterService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getDragonChestStatus(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const config = parseAvatarConfig(character.avatarConfig);
    const progress = config.secrets?.[DRAGON_CHEST_SECRET.key];

    return {
      eligible: character.level >= DRAGON_CHEST_SECRET.minLevel,
      discovered: !!progress?.discoveredAt,
      completed: !!progress?.completedAt,
      discoveredAt: progress?.discoveredAt ?? null,
    };
  }

  async discoverDragonChest(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    if (character.level < DRAGON_CHEST_SECRET.minLevel) {
      throw new Error("Aún no estás listo para esta aventura");
    }

    const config = parseAvatarConfig(character.avatarConfig);
    const progress = config.secrets?.[DRAGON_CHEST_SECRET.key];
    if (progress?.completedAt) {
      return { alreadyCompleted: true as const };
    }

    if (progress?.discoveredAt) {
      return { alreadyDiscovered: true as const, discoveredAt: progress.discoveredAt };
    }

    const discoveredAt = new Date().toISOString();
    const nextConfig = mergeAvatarConfig(character.avatarConfig, {
      secrets: {
        [DRAGON_CHEST_SECRET.key]: {
          ...progress,
          discoveredAt,
          attempts: progress?.attempts ?? 0,
        },
      },
    });

    await this.characterRepo.update(characterId, { avatarConfig: nextConfig });
    await this.gameEventRepo.create(characterId, "SECRET_DISCOVERED", {
      secretKey: DRAGON_CHEST_SECRET.key,
    });

    return { discoveredAt };
  }

  async completeDragonChest(
    characterId: string,
    metadata: { memoryTurns: number; rhythmScore: number }
  ) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const config = parseAvatarConfig(character.avatarConfig);
    const progress = config.secrets?.[DRAGON_CHEST_SECRET.key];

    if (progress?.completedAt) {
      throw new Error("Ya abriste el cofre del dragón");
    }
    if (!progress?.discoveredAt) {
      throw new Error("Aún no has descubierto el cofre");
    }

    const elapsedSeconds =
      (Date.now() - new Date(progress.discoveredAt).getTime()) / 1000;
    if (elapsedSeconds < DRAGON_CHEST_SECRET.minPlaySeconds) {
      throw new Error("El dragón necesita ver que lo intentas de verdad");
    }

    if (metadata.rhythmScore < 3) {
      throw new Error("No has superado el latido del dragón");
    }

    const achievement = await prisma.achievement.findFirst({
      where: {
        icon: DRAGON_CHEST_SECRET.achievementIcon,
        isActive: true,
        OR: [{ familyId: character.familyId }, { familyId: null }],
      },
    });
    if (!achievement) throw new Error("Logro secreto no configurado");

    const isUnlocked = await this.achievementRepo.isUnlocked(characterId, achievement.id);
    if (!isUnlocked) {
      await this.achievementRepo.unlock(characterId, achievement.id);
      await this.gameEventRepo.create(characterId, "ACHIEVEMENT_UNLOCKED", {
        achievementId: achievement.id,
        title: achievement.title,
        secret: true,
      });
    }

    const isClaimed = await this.achievementRepo.isClaimed(characterId, achievement.id);
    if (!isClaimed && achievement.crystalReward > 0) {
      await this.achievementRepo.claim(characterId, achievement.id);
      await this.characterService.addCrystals(
        characterId,
        achievement.crystalReward,
        `Logro secreto: ${achievement.title}`
      );
      await this.gameEventRepo.create(characterId, "ACHIEVEMENT_CLAIMED", {
        achievementId: achievement.id,
        title: achievement.title,
        crystals: achievement.crystalReward,
        secret: true,
      });
    }

    const vitalitySkill = character.skills.find((s) => s.skill.key === "vitality");
    const { levelUp } = await this.characterService.addXp(
      characterId,
      DRAGON_CHEST_SECRET.xpReward,
      vitalitySkill?.skillId
    );

    const unlockedAccessories = new Set([
      ...(config.unlockedAccessories ?? []),
      DRAGON_CHEST_SECRET.accessoryKey,
    ]);

    const nextConfig = mergeAvatarConfig(character.avatarConfig, {
      unlockedAccessories: [...unlockedAccessories],
      equipped: {
        ...config.equipped,
        hat: DRAGON_CHEST_SECRET.accessoryKey,
      },
      secrets: {
        [DRAGON_CHEST_SECRET.key]: {
          ...progress,
          completedAt: new Date().toISOString(),
          attempts: (progress.attempts ?? 0) + 1,
        },
      },
    });

    await this.characterRepo.update(characterId, { avatarConfig: nextConfig });

    await this.gameEventRepo.create(characterId, "SECRET_COMPLETED", {
      secretKey: DRAGON_CHEST_SECRET.key,
      memoryTurns: metadata.memoryTurns,
      rhythmScore: metadata.rhythmScore,
      achievementId: achievement.id,
    });

    return {
      achievement: {
        title: achievement.title,
        crystalReward: achievement.crystalReward,
      },
      accessoryKey: DRAGON_CHEST_SECRET.accessoryKey,
      xpReward: DRAGON_CHEST_SECRET.xpReward,
      levelUp,
    };
  }
}
