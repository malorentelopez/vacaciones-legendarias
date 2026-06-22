"use server";

import { requireSession } from "@/lib/auth";
import {
  CharacterService,
  MissionService,
  AchievementService,
  RewardService,
  WeeklyPointsService,
  BossBattleService,
  SkillRepository,
  ConfigurationRepository,
  GameEventRepository,
} from "@repo/domain";
import { prisma } from "@repo/database";
import type { MissionFrequency, MissionType, RewardStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const characterService = new CharacterService();
const missionService = new MissionService();
const achievementService = new AchievementService();
const rewardService = new RewardService();
const weeklyPointsService = new WeeklyPointsService();
const bossBattleService = new BossBattleService();
const skillRepo = new SkillRepository();
const configRepo = new ConfigurationRepository();
const gameEventRepo = new GameEventRepository();

export async function getDashboardStats() {
  const session = await requireSession();
  const characters = await characterService.getFamilyCharacters(session.familyId);
  const today = new Date().toISOString().split("T")[0];

  const missionsCompletedToday = await prisma.missionProgress.count({
    where: {
      completed: true,
      completedAt: { gte: new Date(today) },
      character: { familyId: session.familyId },
    },
  });

  const weeklyXp = characters.reduce((sum, c) => sum + c.weeklyPoints, 0);

  return {
    characters,
    missionsCompletedToday,
    weeklyXp,
    totalCrystals: characters.reduce((sum, c) => sum + c.crystals, 0),
  };
}

export async function getCharacters() {
  const session = await requireSession();
  return characterService.getFamilyCharacters(session.familyId);
}

export async function createCharacter(data: {
  name: string;
  pin: string;
  gender?: "BOY" | "GIRL";
  themeKey?: string;
  avatarBase?: string;
}) {
  const session = await requireSession();

  if (!/^\d{4}$/.test(data.pin)) {
    return { success: false as const, error: "El PIN debe tener exactamente 4 dígitos" };
  }

  const { CharacterRepository } = await import("@repo/domain");
  const characterRepo = new CharacterRepository();
  if (await characterRepo.isPinTaken(data.pin)) {
    return { success: false as const, error: "Este PIN ya está en uso. Elige otro." };
  }

  const pinHash = await bcrypt.hash(data.pin, 10);
  const character = await characterService.createCharacter({
    name: data.name,
    familyId: session.familyId,
    pin: pinHash,
    gender: data.gender,
    themeKey: data.themeKey,
    avatarBase: data.avatarBase,
  });
  revalidatePath("/characters");
  return { success: true as const, character };
}

export async function updateCharacter(
  id: string,
  data: {
    name?: string;
    pin?: string;
    gender?: "BOY" | "GIRL";
    themeKey?: string;
    avatarBase?: string;
  }
) {
  const session = await requireSession();
  const existing = await characterService.getCharacter(id);
  if (existing.familyId !== session.familyId) {
    return { success: false as const, error: "Acceso denegado" };
  }

  const updateData: Parameters<typeof characterService.updateCharacter>[1] = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.themeKey !== undefined) updateData.themeKey = data.themeKey;
  if (data.avatarBase !== undefined) updateData.avatarBase = data.avatarBase;

  if (data.pin !== undefined) {
    if (!/^\d{4}$/.test(data.pin)) {
      return { success: false as const, error: "El PIN debe tener exactamente 4 dígitos" };
    }
    const { CharacterRepository } = await import("@repo/domain");
    const characterRepo = new CharacterRepository();
    if (await characterRepo.isPinTaken(data.pin, id)) {
      return { success: false as const, error: "Este PIN ya está en uso. Elige otro." };
    }
    updateData.pin = await bcrypt.hash(data.pin, 10);
  }

  const character = await characterService.updateCharacter(id, updateData);
  revalidatePath("/characters");
  return { success: true as const, character };
}

export async function deleteCharacter(id: string) {
  const session = await requireSession();
  const existing = await characterService.getCharacter(id);
  if (existing.familyId !== session.familyId) {
    return { success: false as const, error: "Acceso denegado" };
  }

  await characterService.deleteCharacter(id);
  revalidatePath("/characters");
  return { success: true as const };
}

export async function checkPinAvailable(pin: string, excludeCharacterId?: string) {
  await requireSession();
  if (!/^\d{4}$/.test(pin)) return { available: false };
  const { CharacterRepository } = await import("@repo/domain");
  const characterRepo = new CharacterRepository();
  const taken = await characterRepo.isPinTaken(pin, excludeCharacterId);
  return { available: !taken };
}

export async function getCharacterDetail(id: string) {
  const session = await requireSession();
  const character = await characterService.getCharacter(id);
  if (character.familyId !== session.familyId) {
    throw new Error("Acceso denegado");
  }

  const [completedMissions, achievements, recentEvents] = await Promise.all([
    prisma.missionProgress.count({ where: { characterId: id, completed: true } }),
    prisma.characterAchievement.count({ where: { characterId: id } }),
    prisma.gameEvent.findMany({
      where: { characterId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { ...character, completedMissions, achievements, recentEvents };
}

export async function getMissions() {
  const session = await requireSession();
  return missionService.getMissions(session.familyId);
}

export async function createMission(data: {
  title: string;
  description?: string;
  frequency: MissionFrequency;
  type: MissionType;
  xpReward: number;
  crystalReward?: number;
  skillId?: string;
}) {
  await requireSession();
  const mission = await missionService.createMission({ ...data, familyId: (await requireSession()).familyId });
  revalidatePath("/missions");
  return mission;
}

export async function updateMission(id: string, data: Record<string, unknown>) {
  await requireSession();
  await missionService.updateMission(id, data);
  revalidatePath("/missions");
}

export async function deleteMission(id: string) {
  await requireSession();
  await missionService.deleteMission(id);
  revalidatePath("/missions");
}

export async function getAchievements() {
  const session = await requireSession();
  return achievementService.getAchievements(session.familyId);
}

export async function createAchievement(data: {
  title: string;
  description?: string;
  requiredLevel?: number;
  requiredMissions?: number;
  crystalReward?: number;
  missionIds?: string[];
}) {
  const session = await requireSession();
  const achievement = await achievementService.createAchievement({
    ...data,
    familyId: session.familyId,
  });
  revalidatePath("/achievements");
  return achievement;
}

export async function getRewards() {
  const session = await requireSession();
  return rewardService.getRewards(session.familyId);
}

export async function createReward(data: { title: string; description?: string; crystalCost: number }) {
  const session = await requireSession();
  const reward = await rewardService.createReward({ ...data, familyId: session.familyId });
  revalidatePath("/rewards");
  return reward;
}

export async function getPendingPurchases() {
  await requireSession();
  return rewardService.getPurchases(undefined, "PENDING");
}

export async function updatePurchaseStatus(purchaseId: string, status: RewardStatus) {
  await requireSession();
  await rewardService.updatePurchaseStatus(purchaseId, status);
  revalidatePath("/rewards");
}

export async function getSkills() {
  await requireSession();
  return skillRepo.findAll();
}

export async function getLevels() {
  await requireSession();
  return configRepo.getLevels();
}

export async function upsertLevel(level: number, xpRequired: number, crystalReward: number) {
  await requireSession();
  await configRepo.upsertLevel(level, xpRequired, crystalReward);
  revalidatePath("/levels");
}

export async function getScreenTimeConfigs() {
  await requireSession();
  return configRepo.getScreenTimeConfigs();
}

export async function getTimeline() {
  const session = await requireSession();
  return gameEventRepo.findByFamily(session.familyId);
}

export async function applyPenalty(characterId: string, points: number, reason?: string) {
  await requireSession();
  await weeklyPointsService.applyPenalty(characterId, points, reason);
  revalidatePath("/penalties");
}

export async function resetWeeklyPoints() {
  const session = await requireSession();
  await weeklyPointsService.resetWeeklyPoints(session.familyId);
  revalidatePath("/");
}

export async function getWeeklyStats() {
  const session = await requireSession();
  return weeklyPointsService.getFamilyWeeklyStats(session.familyId);
}

export async function getBossBattles() {
  const session = await requireSession();
  return bossBattleService.getBossBattles(session.familyId);
}

export async function createBossBattle(data: {
  title: string;
  description?: string;
  month: number;
  year: number;
  xpReward?: number;
  crystalReward?: number;
}) {
  const session = await requireSession();
  const boss = await bossBattleService.createBossBattle({ ...data, familyId: session.familyId });
  revalidatePath("/bosses");
  return boss;
}

export async function addBossObjective(bossBattleId: string, data: { title: string; description?: string; targetDate?: string }) {
  await requireSession();
  await bossBattleService.addObjective(bossBattleId, {
    ...data,
    targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
  });
  revalidatePath("/bosses");
}
