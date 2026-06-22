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

export async function createCharacter(data: { name: string; pin?: string }) {
  const session = await requireSession();
  const pin = data.pin ? await bcrypt.hash(data.pin, 10) : undefined;
  const character = await characterService.createCharacter({
    name: data.name,
    familyId: session.familyId,
    pin,
  });
  revalidatePath("/characters");
  return character;
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
}) {
  const session = await requireSession();
  const achievement = await achievementService.createAchievement({ ...data, familyId: session.familyId });
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
