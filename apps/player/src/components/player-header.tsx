import { Badge, CharacterPortrait } from "@repo/ui";
import { logout } from "@/actions/auth";
import { LogOut, Star } from "lucide-react";
import { getCharacterPortraitSrc, getTheme, getRoleName, normalizeRoleKey } from "@repo/domain";

interface PlayerHeaderProps {
  name: string;
  level: number;
  themeKey: string;
  gender: "BOY" | "GIRL";
  avatarBase: string;
  avatarConfig?: unknown;
}

export function PlayerHeader({ name, level, themeKey, gender, avatarBase, avatarConfig }: PlayerHeaderProps) {
  const genderKey = gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(themeKey);
  const roleName = getRoleName(themeKey, genderKey, normalizeRoleKey(themeKey, avatarBase));
  const portraitSrc = getCharacterPortraitSrc({ themeKey, gender, avatarBase, avatarConfig });

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <CharacterPortrait
          imageSrc={portraitSrc}
          alt={roleName}
          primaryColor={theme.colors.primary}
          secondaryColor={theme.colors.secondary}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-200">{name}</p>
          <Badge variant="info" className="mt-0.5 text-[10px]">
            <Star className="mr-0.5 inline h-2.5 w-2.5" />
            Nv. {level}
          </Badge>
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-3 w-3" />
          Salir
        </button>
      </form>
    </div>
  );
}
