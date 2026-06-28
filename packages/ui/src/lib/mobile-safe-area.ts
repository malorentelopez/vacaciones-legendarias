/** App chrome background — matches Tailwind `player.bg`. */
export const APP_THEME_COLOR = "#0f172a";

/** Fallback when `env(safe-area-inset-*)` is unavailable (e.g. missing viewport-fit=cover). */
export const MOBILE_SAFE_AREA_FALLBACK = "24px";

/** Breathing room above the home indicator so taps do not trigger system gestures. */
export const MOBILE_BOTTOM_NAV_EXTRA = "0.75rem";

export const mobileBottomNavPaddingStyle = {
  paddingBottom: `calc(env(safe-area-inset-bottom, ${MOBILE_SAFE_AREA_FALLBACK}) + ${MOBILE_BOTTOM_NAV_EXTRA})`,
} as const;

/** Height of the fixed mobile bottom nav including safe-area padding. */
export const mobileBottomNavOffset =
  `calc(4.5rem + env(safe-area-inset-bottom, ${MOBILE_SAFE_AREA_FALLBACK}) + ${MOBILE_BOTTOM_NAV_EXTRA})` as const;

/** Main content padding below fixed mobile bottom nav. */
export const mobileMainBottomClass =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom,24px)+0.75rem)] md:pb-6";

/** Main content padding below fixed mobile bottom nav (admin desktop breakpoint). */
export const mobileMainBottomClassLg =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom,24px)+0.75rem)] lg:pb-8";

/** Mobile top bar offset including status bar safe area. */
export const mobileTopBarClass =
  "pt-[calc(0.75rem+env(safe-area-inset-top,0px))]";

export const mobileMainTopClass =
  "pt-[calc(4rem+env(safe-area-inset-top,0px))]";
