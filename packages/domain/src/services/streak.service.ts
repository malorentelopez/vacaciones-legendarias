import { prisma } from "@repo/database/prisma";
import { CharacterRepository } from "../repositories/character.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import { CharacterService } from "./character.service";
import { ScheduleService } from "./schedule.service";
import { mergeAvatarConfig, parseAvatarConfig } from "../utils/avatar";
import { advanceStreak, isMorningSection } from "../utils/streak";
import { toLocalDateKey } from "../utils/schedule";
import type { StreakFeedback, MorningComboFeedback } from "../types/game-feedback";

const STREAK_MILESTONES = {
  3: { crystals: 5, achievementIcon: "streak-spirit" },
  7: { crystals: 15, unlockAccessory: "pet_cat" },
} as const;

export class StreakService {
  private _scheduleService?: ScheduleService;

  constructor(
    private characterRepo = new CharacterRepository(),
    private characterService = new CharacterService(),
    private achievementRepo = new AchievementRepository(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  private get scheduleService() {
    return (this._scheduleService ??= new ScheduleService());
  }

  async evaluateAfterRouteMission(
    characterId: string,
    missionId: string,
    mission: { isSideQuest: boolean; frequency: string },
    now: Date = new Date()
  ): Promise<{ streak?: StreakFeedback; morningCombo?: MorningComboFeedback }> {
    if (mission.isSideQuest || mission.frequency !== "DAILY") {
      return {};
    }

    const agenda = await this.scheduleService.getAgendaForCharacter(characterId, now);
    if (agenda.isFreeDay) return {};

    const onRoute = agenda.blocks.some((block) => block.missions.some((item) => item.id === missionId));
    if (!onRoute) return {};

    const character = await this.characterRepo.findById(characterId);
    if (!character) return {};

    const todayKey = toLocalDateKey(now);
    const config = parseAvatarConfig(character.avatarConfig);

    const streakFeedback = await this.buildStreakFeedback(
      characterId,
      character.familyId,
      config,
      todayKey
    );

    const morningCombo = await this.buildMorningComboFeedback(
      characterId,
      config,
      agenda.blocks,
      todayKey,
      now
    );

    const nextConfig = mergeAvatarConfig(config, {
      streak: streakFeedback?.nextStreak ?? config.streak,
      combos: morningCombo?.nextCombos ?? config.combos,
      unlockedAccessories: streakFeedback?.unlockedAccessories ?? config.unlockedAccessories,
      equipped: streakFeedback?.equippedPet
        ? { ...config.equipped, pet: streakFeedback.equippedPet }
        : config.equipped,
    });

    if (
      nextConfig.streak !== config.streak ||
      nextConfig.combos !== config.combos ||
      nextConfig.unlockedAccessories !== config.unlockedAccessories ||
      nextConfig.equipped?.pet !== config.equipped?.pet
    ) {
      await this.characterRepo.update(characterId, { avatarConfig: nextConfig });
    }

    return {
      streak: streakFeedback?.feedback,
      morningCombo: morningCombo?.feedback,
    };
  }

  private async buildStreakFeedback(
    characterId: string,
    familyId: string,
    config: ReturnType<typeof parseAvatarConfig>,
    todayKey: string
  ) {
    const update = advanceStreak(config.streak, todayKey);
    if (!update.incremented) {
      return {
        feedback: {
          current: update.streak.current,
          incremented: false,
          reset: false,
        } satisfies StreakFeedback,
        nextStreak: update.streak,
        unlockedAccessories: config.unlockedAccessories,
      };
    }

    let milestone: StreakFeedback["milestone"];
    const milestonesAwarded = [...(update.streak.milestonesAwarded ?? [])];
    let unlockedAccessories = [...(config.unlockedAccessories ?? [])];
    let equippedPet: string | undefined;

    for (const days of [3, 7] as const) {
      if (update.streak.current < days || milestonesAwarded.includes(days)) continue;

      const reward = STREAK_MILESTONES[days];
      await this.characterService.addCrystals(
        characterId,
        reward.crystals,
        `Racha de ${days} días`
      );

      if (days === 3 && "achievementIcon" in reward) {
        const achievement = await prisma.achievement.findFirst({
          where: {
            icon: reward.achievementIcon,
            OR: [{ familyId }, { familyId: null }],
          },
        });
        if (achievement && !(await this.achievementRepo.isUnlocked(characterId, achievement.id))) {
          await this.achievementRepo.unlock(characterId, achievement.id);
          await this.gameEventRepo.create(characterId, "ACHIEVEMENT_UNLOCKED", {
            achievementId: achievement.id,
            title: achievement.title,
          });
        }
      }

      if (days === 7) {
        const accessory = STREAK_MILESTONES[7].unlockAccessory;
        if (!unlockedAccessories.includes(accessory)) {
          unlockedAccessories = [...unlockedAccessories, accessory];
        }
        if (!config.equipped?.pet || config.equipped.pet === "default") {
          equippedPet = accessory;
        }
      }

      milestonesAwarded.push(days);
      milestone = { days, crystals: reward.crystals };

      await this.gameEventRepo.create(characterId, "STREAK_MILESTONE", {
        days,
        crystals: reward.crystals,
      });
    }

    const nextStreak = { ...update.streak, milestonesAwarded };

    return {
      feedback: {
        current: nextStreak.current,
        incremented: true,
        reset: update.reset,
        milestone,
      } satisfies StreakFeedback,
      nextStreak,
      unlockedAccessories,
      equippedPet,
    };
  }

  private async buildMorningComboFeedback(
    characterId: string,
    config: ReturnType<typeof parseAvatarConfig>,
    blocks: Awaited<ReturnType<ScheduleService["getAgendaForCharacter"]>>["blocks"],
    todayKey: string,
    now: Date
  ) {
    if (now.getHours() >= 12) return undefined;
    if (config.combos?.morningBonusDate === todayKey) return undefined;

    const morningBlocks = blocks.filter((block) => isMorningSection(block.section));
    if (morningBlocks.length === 0) return undefined;

    const allMorningComplete = morningBlocks.every(
      (block) => block.missions.length > 0 && block.missions.every((mission) => mission.completed)
    );
    if (!allMorningComplete) return undefined;

    const crystals = 5;
    await this.characterService.addCrystals(characterId, crystals, "Combo matinal");
    await this.gameEventRepo.create(characterId, "COMBO_MORNING", { crystals });

    return {
      feedback: { awarded: true, crystals } satisfies MorningComboFeedback,
      nextCombos: { morningBonusDate: todayKey },
    };
  }
}
