"use server";

import { requireSession } from "@/lib/auth";
import {
  CharacterService,
  MissionService,
  AchievementService,
  RewardService,
  BossBattleService,
  GameEventRepository,
} from "@repo/domain";
import { revalidatePath } from "next/cache";

const characterService = new CharacterService();
const missionService = new MissionService();
const achievementService = new AchievementService();
const rewardService = new RewardService();
const bossBattleService = new BossBattleService();
const gameEventRepo = new GameEventRepository();

export async function getCharacter() {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return characterService.getCharacter(session.characterId);
}

export async function getFamilyCharacters() {
  const session = await requireSession("CHILD");
  return characterService.getFamilyCharacters(session.familyId);
}

export async function getMissions() {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return missionService.getMissionsForCharacter(session.characterId, session.familyId);
}

export async function completeMission(missionId: string) {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await missionService.completeMission(missionId, session.characterId);
  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath("/achievements");
  return result;
}

export async function getAchievements() {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return achievementService.getCharacterAchievements(session.characterId);
}

export async function getRewards() {
  const session = await requireSession("CHILD");
  return rewardService.getRewards(session.familyId);
}

export async function purchaseReward(rewardId: string) {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await rewardService.purchaseReward(rewardId, session.characterId);
  revalidatePath("/store");
  revalidatePath("/");
  return result;
}

export async function getBossBattles() {
  const session = await requireSession("CHILD");
  return bossBattleService.getBossBattles(session.familyId);
}

export async function completeBossObjective(objectiveId: string) {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await bossBattleService.completeObjective(objectiveId, session.characterId);
  revalidatePath("/boss-battles");
  revalidatePath("/");
  return result;
}

export async function getTimeline() {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return gameEventRepo.findByCharacter(session.characterId);
}

export async function updateAvatar(avatarBase: string, avatarConfig: object) {
  const session = await requireSession("CHILD");
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  await characterService.updateCharacter(session.characterId, { avatarBase, avatarConfig });
  revalidatePath("/");
  revalidatePath("/avatar");
}
