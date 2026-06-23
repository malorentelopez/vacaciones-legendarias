import { prisma } from "@repo/database";
import {
  DRAGON_CHEST_SECRET,
  MANGA_POWER_COMBO_SECRET,
  OCEAN_FISHING_SECRET,
} from "../config/secrets";
import { CharacterRepository } from "../repositories/character.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import { CharacterService } from "./character.service";
import { mergeAvatarConfig, parseAvatarConfig } from "../utils/avatar";

type SecretDefinition = {
  key: string;
  achievementIcon: string;
  accessoryKey: string;
  minLevel: number;
  xpReward: number;
  minPlaySeconds: number;
  equipSlot: "hat" | "pet";
};

const DRAGON_CONFIG: SecretDefinition = { ...DRAGON_CHEST_SECRET, equipSlot: "hat" };
const MANGA_COMBO_CONFIG: SecretDefinition = { ...MANGA_POWER_COMBO_SECRET, equipSlot: "hat" };
const OCEAN_FISHING_CONFIG: SecretDefinition = { ...OCEAN_FISHING_SECRET, equipSlot: "pet" };

export class SecretService {
  constructor(
    private characterRepo = new CharacterRepository(),
    private achievementRepo = new AchievementRepository(),
    private characterService = new CharacterService(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getDragonChestStatus(characterId: string) {
    return this.getStatus(characterId, DRAGON_CONFIG);
  }

  async discoverDragonChest(characterId: string) {
    return this.discover(characterId, DRAGON_CONFIG, async (character) => {
      if (character.level < DRAGON_CONFIG.minLevel) {
        throw new Error("Aún no estás listo para esta aventura");
      }
    });
  }

  async completeDragonChest(
    characterId: string,
    metadata: { memoryTurns: number; rhythmScore: number }
  ) {
    return this.complete(characterId, DRAGON_CONFIG, metadata, (meta) => {
      if (meta.rhythmScore < 3) {
        throw new Error("No has superado el latido del dragón");
      }
    });
  }

  async getMangaPowerComboStatus(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const base = await this.getStatus(characterId, MANGA_COMBO_CONFIG);
    return {
      ...base,
      eligible:
        base.eligible &&
        character.themeKey === MANGA_POWER_COMBO_SECRET.requiredTheme &&
        character.level >= MANGA_COMBO_CONFIG.minLevel,
    };
  }

  async discoverMangaPowerCombo(characterId: string) {
    return this.discover(characterId, MANGA_COMBO_CONFIG, async (character) => {
      if (character.themeKey !== MANGA_POWER_COMBO_SECRET.requiredTheme) {
        throw new Error("Este secreto solo aparece en el mundo manga");
      }
      if (character.level < MANGA_COMBO_CONFIG.minLevel) {
        throw new Error("Tu poder aún no despierta");
      }
    });
  }

  async completeMangaPowerCombo(
    characterId: string,
    metadata: { sequenceScore: number }
  ) {
    return this.complete(characterId, MANGA_COMBO_CONFIG, metadata, (meta) => {
      if (meta.sequenceScore < MANGA_POWER_COMBO_SECRET.sequenceLength) {
        throw new Error("No has completado el combo de poder");
      }
    });
  }

  async getOceanFishingStatus(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const base = await this.getStatus(characterId, OCEAN_FISHING_CONFIG);
    const crystalReady = character.crystals === OCEAN_FISHING_SECRET.requiredCrystals;

    return {
      ...base,
      eligible:
        base.eligible &&
        character.themeKey === OCEAN_FISHING_SECRET.requiredTheme &&
        character.level >= OCEAN_FISHING_CONFIG.minLevel &&
        crystalReady,
      crystalReady,
    };
  }

  async discoverOceanFishing(characterId: string) {
    return this.discover(characterId, OCEAN_FISHING_CONFIG, async (character) => {
      if (character.themeKey !== OCEAN_FISHING_SECRET.requiredTheme) {
        throw new Error("Este secreto solo aparece en el mundo océano");
      }
      if (character.crystals !== OCEAN_FISHING_SECRET.requiredCrystals) {
        throw new Error("Los cristales no brillan todavía");
      }
      if (character.level < OCEAN_FISHING_CONFIG.minLevel) {
        throw new Error("Aún no estás listo para pescar");
      }
    });
  }

  async completeOceanFishing(characterId: string, metadata: { fishCaught: number }) {
    return this.complete(characterId, OCEAN_FISHING_CONFIG, metadata, (meta) => {
      if (meta.fishCaught < OCEAN_FISHING_SECRET.minFishCaught) {
        throw new Error("No has pescado suficientes peces");
      }
    });
  }

  private async getStatus(characterId: string, secret: SecretDefinition) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const config = parseAvatarConfig(character.avatarConfig);
    const progress = config.secrets?.[secret.key];

    return {
      eligible: character.level >= secret.minLevel,
      discovered: !!progress?.discoveredAt,
      completed: !!progress?.completedAt,
      discoveredAt: progress?.discoveredAt ?? null,
    };
  }

  private async discover(
    characterId: string,
    secret: SecretDefinition,
    validate?: (character: NonNullable<Awaited<ReturnType<CharacterRepository["findById"]>>>) => void | Promise<void>
  ) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    await validate?.(character);

    const config = parseAvatarConfig(character.avatarConfig);
    const progress = config.secrets?.[secret.key];
    if (progress?.completedAt) {
      return { alreadyCompleted: true as const };
    }

    if (progress?.discoveredAt) {
      return { alreadyDiscovered: true as const, discoveredAt: progress.discoveredAt };
    }

    const discoveredAt = new Date().toISOString();
    const nextConfig = mergeAvatarConfig(character.avatarConfig, {
      secrets: {
        [secret.key]: {
          ...progress,
          discoveredAt,
          attempts: progress?.attempts ?? 0,
        },
      },
    });

    await this.characterRepo.update(characterId, { avatarConfig: nextConfig });
    await this.gameEventRepo.create(characterId, "SECRET_DISCOVERED", {
      secretKey: secret.key,
    });

    return { discoveredAt };
  }

  private async complete<T extends Record<string, unknown>>(
    characterId: string,
    secret: SecretDefinition,
    metadata: T,
    validate: (metadata: T) => void
  ) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const config = parseAvatarConfig(character.avatarConfig);
    const progress = config.secrets?.[secret.key];

    if (progress?.completedAt) {
      throw new Error("Ya completaste este secreto");
    }
    if (!progress?.discoveredAt) {
      throw new Error("Aún no has descubierto este secreto");
    }

    const elapsedSeconds =
      (Date.now() - new Date(progress.discoveredAt).getTime()) / 1000;
    if (elapsedSeconds < secret.minPlaySeconds) {
      throw new Error("Necesitas más práctica antes de reclamar la recompensa");
    }

    validate(metadata);

    const achievement = await prisma.achievement.findFirst({
      where: {
        icon: secret.achievementIcon,
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
      secret.xpReward,
      vitalitySkill?.skillId
    );

    const unlockedAccessories = new Set([
      ...(config.unlockedAccessories ?? []),
      secret.accessoryKey,
    ]);

    const equippedPatch =
      secret.equipSlot === "hat"
        ? { hat: secret.accessoryKey }
        : { pet: secret.accessoryKey };

    const nextConfig = mergeAvatarConfig(character.avatarConfig, {
      unlockedAccessories: [...unlockedAccessories],
      equipped: {
        ...config.equipped,
        ...equippedPatch,
      },
      secrets: {
        [secret.key]: {
          ...progress,
          completedAt: new Date().toISOString(),
          attempts: (progress.attempts ?? 0) + 1,
        },
      },
    });

    await this.characterRepo.update(characterId, { avatarConfig: nextConfig });

    await this.gameEventRepo.create(characterId, "SECRET_COMPLETED", {
      secretKey: secret.key,
      ...metadata,
      achievementId: achievement.id,
    } as Record<string, string | number>);

    return {
      achievement: {
        title: achievement.title,
        crystalReward: achievement.crystalReward,
      },
      accessoryKey: secret.accessoryKey,
      xpReward: secret.xpReward,
      levelUp,
    };
  }
}
