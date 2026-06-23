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

export {
  parseAvatarConfig,
  getCharacterPortraitSrc,
  hasCustomAvatar,
  getEquippedHatEmoji,
  getUnlockedAccessoryKeys,
  mergeAvatarConfig,
  type AvatarConfig,
} from "./utils/avatar";

export { DRAGON_CHEST_SECRET, MEMORY_PAIRS_BY_THEME, ACCESSORY_DISPLAY } from "./config/secrets";

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

export { getPeriodKey, getWeekKey, calculateXpForNextLevel } from "./utils/period";

export {
  TIER_LABELS,
  formatWeeksLabel,
  type EconomyProjection,
  type ProgressScenario,
  type RewardTier,
} from "./utils/crystal-projection";

export {
  parseQuestionnaireJson,
  parsedToQuestionForms,
  QUESTIONNAIRE_JSON_EXAMPLE,
  type ParsedQuestionnaire,
} from "./utils/questionnaire-import";

export type { QuestionnaireState } from "./types/questionnaire";
export type { LevelUpInfo, BossVictoryInfo } from "./types/game-feedback";
