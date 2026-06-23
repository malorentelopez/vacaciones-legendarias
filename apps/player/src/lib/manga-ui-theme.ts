export interface MangaUiTheme {
  completeSfx: string;
  outline: string;
  shadow: string;
  burst: string;
}

const MANGA_UI_THEMES: Record<string, MangaUiTheme> = {
  manga: {
    completeSfx: "¡ZAS!",
    outline: "#312e81",
    shadow: "#1e1b4b",
    burst: "#fef08a",
  },
  adventure: {
    completeSfx: "¡CLANG!",
    outline: "#4c1d95",
    shadow: "#2e1065",
    burst: "#fde68a",
  },
  ocean: {
    completeSfx: "¡SPLASH!",
    outline: "#0c4a6e",
    shadow: "#082f49",
    burst: "#a5f3fc",
  },
};

export function getMangaUiTheme(themeKey: string): MangaUiTheme {
  return MANGA_UI_THEMES[themeKey] ?? MANGA_UI_THEMES.manga!;
}
