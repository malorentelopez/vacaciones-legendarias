import { CharacterRepository } from "../repositories/character.repository";
import { ConfigurationRepository } from "../repositories/skill.repository";
import { GameEventRepository } from "../repositories/game-event.repository";
import { calculateXpForNextLevel } from "../utils/period";
import { stripProgressFromAvatarConfig } from "../utils/avatar";

export class CharacterService {
  constructor(
    private characterRepo = new CharacterRepository(),
    private configRepo = new ConfigurationRepository(),
    private gameEventRepo = new GameEventRepository()
  ) {}

  async getCharacter(id: string) {
    const character = await this.characterRepo.findById(id);
    if (!character) throw new Error("Personaje no encontrado");

    const levels = await this.configRepo.getLevels();
    const xpProgress = calculateXpForNextLevel(character.level, character.xp, levels);

    return { ...character, xpProgress };
  }

  async getFamilyCharacters(familyId: string) {
    const characters = await this.characterRepo.findByFamily(familyId);
    const levels = await this.configRepo.getLevels();

    return Promise.all(
      characters.map(async (character) => ({
        ...character,
        xpProgress: calculateXpForNextLevel(character.level, character.xp, levels),
      }))
    );
  }

  async getFamilyCharactersForDashboard(familyId: string) {
    const [characters, levels] = await Promise.all([
      this.characterRepo.findByFamilyForDashboard(familyId),
      this.configRepo.getLevels(),
    ]);

    return characters.map((character) => ({
      ...character,
      xpProgress: calculateXpForNextLevel(character.level, character.xp, levels),
    }));
  }

  async createCharacter(data: {
    name: string;
    familyId: string;
    userId?: string;
    pin?: string;
    avatarBase?: string;
    gender?: "BOY" | "GIRL";
    themeKey?: string;
  }) {
    const character = await this.characterRepo.create(data);
    await this.gameEventRepo.create(character.id, "CHARACTER_CREATED", { name: character.name });
    return character;
  }

  async updateCharacter(
    id: string,
    data: Partial<{
      name: string;
      gender: "BOY" | "GIRL";
      themeKey: string;
      avatarBase: string;
      avatarConfig: object;
      pin: string;
    }>
  ) {
    return this.characterRepo.update(id, data);
  }

  async deleteCharacter(id: string) {
    return this.characterRepo.delete(id);
  }

  async addXp(characterId: string, amount: number, skillId?: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const newXp = character.xp + amount;
    const newWeeklyPoints = character.weeklyPoints + amount;

    await this.characterRepo.update(characterId, {
      xp: newXp,
      weeklyPoints: newWeeklyPoints,
    });

    await this.gameEventRepo.create(characterId, "XP_GAINED", {
      amount,
      skillId,
      totalXp: newXp,
    });

    if (skillId) {
      const characterSkill = character.skills.find((s) => s.skillId === skillId);
      if (characterSkill) {
        const skillXp = characterSkill.xp + amount;
        const skillLevel = Math.floor(skillXp / 100) + 1;
        await this.characterRepo.updateSkillXp(characterSkill.id, skillXp, skillLevel);
      }
    }

    const levels = await this.configRepo.getLevels();
    const levelUp = await this.checkLevelUp(characterId, newXp, character.level, levels);

    return { newXp, levelUp };
  }

  private async checkLevelUp(
    characterId: string,
    xp: number,
    currentLevel: number,
    levels: { level: number; xpRequired: number; crystalReward: number }[]
  ) {
    const nextLevel = levels.find((l) => l.level === currentLevel + 1);
    if (!nextLevel || xp < nextLevel.xpRequired) return null;

    const character = await this.characterRepo.findById(characterId);
    if (!character) return null;

    const newCrystals = character.crystals + nextLevel.crystalReward;
    await this.characterRepo.update(characterId, {
      level: nextLevel.level,
      crystals: newCrystals,
    });

    await this.gameEventRepo.create(characterId, "LEVEL_UP", {
      newLevel: nextLevel.level,
      crystalReward: nextLevel.crystalReward,
    });

    if (nextLevel.crystalReward > 0) {
      await this.gameEventRepo.create(characterId, "CRYSTALS_GAINED", {
        amount: nextLevel.crystalReward,
        reason: `Subida a nivel ${nextLevel.level}`,
      });
    }

    return { newLevel: nextLevel.level, crystalReward: nextLevel.crystalReward };
  }

  async addCrystals(characterId: string, amount: number, reason: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    await this.characterRepo.update(characterId, {
      crystals: character.crystals + amount,
    });

    await this.gameEventRepo.create(characterId, "CRYSTALS_GAINED", { amount, reason });
    return character.crystals + amount;
  }

  async resetCharacterProgress(characterId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error("Personaje no encontrado");

    const avatarConfig = stripProgressFromAvatarConfig(character.avatarConfig);
    await this.characterRepo.resetProgress(characterId, avatarConfig);
    return this.getCharacter(characterId);
  }
}
