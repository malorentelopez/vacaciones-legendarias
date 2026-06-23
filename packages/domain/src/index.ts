export { CharacterService } from "./services/character.service";
export { MissionService } from "./services/mission.service";
export { QuestionnaireService } from "./services/questionnaire.service";
export type { QuestionnaireState } from "./types/questionnaire";
export { AchievementService } from "./services/achievement.service";
export { RewardService } from "./services/reward.service";
export { CrystalEconomyService } from "./services/crystal-economy.service";
export { WeeklyPointsService } from "./services/weekly-points.service";
export { BossBattleService } from "./services/boss-battle.service";
export { ScheduleService } from "./services/schedule.service";

export { CharacterRepository } from "./repositories/character.repository";
export { MissionRepository } from "./repositories/mission.repository";
export { QuestionnaireRepository } from "./repositories/questionnaire.repository";
export { AchievementRepository } from "./repositories/achievement.repository";
export { RewardRepository } from "./repositories/reward.repository";
export { GameEventRepository } from "./repositories/game-event.repository";
export { ScheduleRepository } from "./repositories/schedule.repository";
export { FreeDayRepository } from "./repositories/free-day.repository";
export {
  SkillRepository,
  ConfigurationRepository,
  BossBattleRepository,
} from "./repositories/skill.repository";

export {
  gradeAnswers,
  stripCorrectAnswers,
  type QuestionOption,
  type GradeResult,
} from "./utils/questionnaire";
export {
  parseQuestionnaireJson,
  parsedToQuestionForms,
  QUESTIONNAIRE_JSON_EXAMPLE,
  type ParsedQuestionnaire,
} from "./utils/questionnaire-import";
export { getPeriodKey, getWeekKey, calculateXpForNextLevel } from "./utils/period";
export {
  SCENARIO_RATES,
  TIER_LABELS,
  TIER_THRESHOLDS,
  formatWeeksLabel,
  projectEconomy,
  getRewardTier,
  type EconomyProjection,
  type ProgressScenario,
  type RewardProjection,
  type RewardTier,
  type WeeklyIncomeBreakdown,
} from "./utils/crystal-projection";
export {
  getDayScheduleType,
  getDayScheduleTypeLabel,
  parseTimeToMinutes,
  isTimeInBlock,
  formatAgendaDate,
  toLocalDateKey,
  parseLocalDateKey,
  dateKeyToDbDate,
  dbDateToDateKey,
  DAY_NAMES,
  MONTH_NAMES,
} from "./utils/schedule";
export {
  parseAvatarConfig,
  getCharacterPortraitSrc,
  hasCustomAvatar,
  type AvatarConfig,
} from "./utils/avatar";

export {
  THEMES,
  THEME_LIST,
  getTheme,
  getAvatarEmoji,
  getThemeRoles,
  getThemeAvatars,
  getRoleName,
  getRoleImage,
  normalizeRoleKey,
  type ThemeConfig,
  type ThemeAvatar,
  type ThemeRole,
  type CharacterGender,
} from "./config/themes";
