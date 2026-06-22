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
  type AvatarConfig,
} from "./utils/avatar";

export {
  getDayScheduleType,
  parseTimeToMinutes,
  isTimeInBlock,
  formatAgendaDate,
  DAY_NAMES,
  MONTH_NAMES,
} from "./utils/schedule";

export { getPeriodKey, getWeekKey, calculateXpForNextLevel } from "./utils/period";
