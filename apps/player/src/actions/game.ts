"use server";

import { requirePlayerSession } from "@/lib/player-session";
import {
  CharacterService,
  MissionService,
  QuestionnaireService,
  AchievementService,
  RewardService,
  BossBattleService,
  ScheduleService,
  GameEventRepository,
} from "@repo/domain";
import { revalidatePath } from "next/cache";

const characterService = new CharacterService();
const missionService = new MissionService();
const questionnaireService = new QuestionnaireService();
const achievementService = new AchievementService();
const rewardService = new RewardService();
const bossBattleService = new BossBattleService();
const scheduleService = new ScheduleService();
const gameEventRepo = new GameEventRepository();

export async function getCharacter() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return characterService.getCharacter(session.characterId);
}

export async function getFamilyCharacters() {
  const session = await requirePlayerSession();
  return characterService.getFamilyCharacters(session.familyId);
}

export async function getMissions() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return missionService.getMissionsForCharacter(session.characterId, session.familyId);
}

export async function getSideQuests() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return missionService.getSideQuestsForCharacter(session.characterId, session.familyId);
}

export async function getAgenda() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return scheduleService.getAgendaForCharacter(session.characterId);
}

export async function completeMission(missionId: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await missionService.completeMission(missionId, session.characterId);
  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath("/side-quests");
  revalidatePath("/calendar");
  revalidatePath("/ruta");
  revalidatePath("/achievements");
  return result;
}

export async function getQuestionnaireForMission(missionId: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const active = await questionnaireService.getActiveQuestionnaireForCharacter(
    missionId,
    session.characterId
  );
  if (!active) throw new Error("No hay cuestionario disponible");

  return questionnaireService.getQuestionnaireForPlayer(
    active.id,
    session.characterId,
    session.familyId
  );
}

export async function submitQuestionnaire(
  questionnaireId: string,
  answers: Record<string, string>
) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");

  const result = await questionnaireService.submitQuestionnaire(
    questionnaireId,
    session.characterId,
    session.familyId,
    answers
  );

  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath("/side-quests");
  revalidatePath("/ruta");
  revalidatePath("/achievements");

  return {
    correctCount: result.correctCount,
    totalCount: result.totalCount,
    passed: result.passed,
    missionCompleted: result.missionCompleted,
    levelUp: result.levelUp,
    xpReward: result.xpReward,
    crystalReward: result.crystalReward,
  };
}

export async function getAchievements() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  await achievementService.evaluateAchievements(session.characterId);
  return achievementService.getCharacterAchievements(session.characterId, session.familyId);
}

export async function claimAchievement(achievementId: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await achievementService.claimAchievement(session.characterId, achievementId);
  revalidatePath("/achievements");
  revalidatePath("/");
  return result;
}

export async function getRewards() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return rewardService.getStoreRewards(session.familyId, session.characterId);
}

export async function purchaseReward(rewardId: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await rewardService.purchaseReward(rewardId, session.characterId);
  revalidatePath("/store");
  revalidatePath("/");
  return result;
}

export async function getBossBattles() {
  const session = await requirePlayerSession();
  return bossBattleService.getBossBattles(session.familyId);
}

export async function completeBossObjective(objectiveId: string) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  const result = await bossBattleService.completeObjective(objectiveId, session.characterId);
  revalidatePath("/boss-battles");
  revalidatePath("/");
  return result;
}

export async function getTimeline() {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  return gameEventRepo.findByCharacter(session.characterId);
}

export async function updateAvatar(data: {
  name?: string;
  gender?: "BOY" | "GIRL";
  themeKey?: string;
  avatarBase?: string;
  avatarConfig?: object;
}) {
  const session = await requirePlayerSession();
  if (!session.characterId) throw new Error("Sin personaje seleccionado");
  await characterService.updateCharacter(session.characterId, data);
  revalidatePath("/");
  revalidatePath("/avatar");
}

export async function getThemes() {
  const { THEME_LIST } = await import("@repo/domain");
  return THEME_LIST;
}
