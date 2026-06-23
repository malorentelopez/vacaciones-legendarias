import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Progress, Badge, SkillIcon } from "@repo/ui";
import { Gem, Star, Zap, Crown, Map, Scroll, Sparkles } from "lucide-react";
import {
  getTheme,
  getRoleName,
  normalizeRoleKey,
  getCharacterPortraitSrc,
  getEquippedHatEmoji,
} from "@repo/domain";
import { PowerGauge } from "@/components/power-gauge";
import { MagicalEnergyGauge } from "@/components/magical-energy-gauge";
import { MANGA_COPY } from "@/lib/manga-copy";
import { formatSummerChapter, type SummerChapter } from "@repo/domain";
import { themeProgressBar } from "@/lib/theme-ui";
import { SecretPortraitTrigger } from "@/components/secrets/secret-portrait-trigger";

interface CharacterData {
  id: string;
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
  avatarConfig?: unknown;
  level: number;
  xp: number;
  crystals: number;
  weeklyPoints: number;
  skills: {
    id: string;
    xp: number;
    level: number;
    skill: { name: string; icon: string; color: string };
  }[];
  xpProgress: { xpInLevel: number; xpNeeded: number; progress: number };
}

interface FamilyCharacter {
  id: string;
  name: string;
  level: number;
  weeklyPoints: number;
}

interface RoutePreview {
  currentBlockTitle?: string;
  currentBlockIcon?: string | null;
  completedQuests: number;
  totalQuests: number;
  totalStages: number;
}

interface SideQuestsPreview {
  completedSideQuests: number;
  totalSideQuests: number;
}

interface DragonChestStatus {
  eligible: boolean;
  discovered: boolean;
  completed: boolean;
}

export function DashboardView({
  character,
  familyCharacters = [],
  routePreview,
  sideQuestsPreview,
  dragonChestStatus,
  chapter,
}: {
  character: CharacterData;
  familyCharacters?: FamilyCharacter[];
  routePreview?: RoutePreview;
  sideQuestsPreview?: SideQuestsPreview;
  dragonChestStatus?: DragonChestStatus;
  chapter?: SummerChapter;
}) {
  const ranking = [...familyCharacters].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(character.themeKey);
  const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);
  const roleName = getRoleName(character.themeKey, genderKey, roleKey);
  const portraitSrc = getCharacterPortraitSrc(character);
  const hatEmoji = getEquippedHatEmoji(character.avatarConfig);
  const chestStatus = dragonChestStatus ?? { eligible: false, discovered: false, completed: false };
  const showRoute = routePreview && routePreview.totalStages > 0;
  const showSideQuests = sideQuestsPreview && sideQuestsPreview.totalSideQuests > 0;
  const showProgressCards = showRoute || showSideQuests;

  return (
    <div className="space-y-8">
      {chapter && chapter.number > 0 && (
        <p className="theme-eyebrow font-display text-sm tracking-wide">
          {formatSummerChapter(chapter)}
        </p>
      )}
      <Card
        className="theme-card-border overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}18 0%, transparent 60%)` }}
      >
        <CardContent className="flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
          <div className="flex flex-col items-center">
            <SecretPortraitTrigger
              imageSrc={portraitSrc}
              alt={roleName}
              primaryColor={theme.colors.primary}
              secondaryColor={theme.colors.secondary}
              eligible={chestStatus.eligible}
              discovered={chestStatus.discovered}
              completed={chestStatus.completed}
              hatEmoji={hatEmoji}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="theme-label text-[10px] sm:text-xs">Tu héroe</p>
            <h1 className="truncate text-2xl font-bold sm:text-3xl" style={{ color: theme.colors.heading }}>
              {character.name}
            </h1>
            <p className="truncate text-sm text-slate-400">
              {roleName} · {theme.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              <Badge variant="info" className="text-xs">
                <Star className="mr-1 inline h-3 w-3" />
                Nv. {character.level}
              </Badge>
              <Badge variant="warning" className="text-xs">
                <Gem className="mr-1 inline h-3 w-3" />
                {character.crystals} 💎
              </Badge>
              <Badge variant="success" className="text-xs">
                <Zap className="mr-1 inline h-3 w-3" />
                {character.weeklyPoints} pts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <MagicalEnergyGauge weeklyPoints={character.weeklyPoints} />

      <div className={`grid gap-4 ${showProgressCards ? "lg:grid-cols-2 lg:gap-6" : ""}`}>
        {showRoute && routePreview && (
          <Link href="/ruta" className="block h-full">
            <Card className="theme-card-border theme-card-hover group h-full cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Map className="theme-icon h-5 w-5" />
                  Ruta legendaria de hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routePreview.currentBlockTitle ? (
                  <p className="text-sm text-slate-300">
                    Etapa activa: {routePreview.currentBlockIcon && `${routePreview.currentBlockIcon} `}
                    <span className="font-medium text-white">{routePreview.currentBlockTitle}</span>
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">Consulta tu mapa del día</p>
                )}
                {routePreview.totalQuests > 0 && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-400">
                      <span>Quests completadas</span>
                      <span>
                        {routePreview.completedQuests}/{routePreview.totalQuests}
                      </span>
                    </div>
                    <Progress
                      value={Math.round((routePreview.completedQuests / routePreview.totalQuests) * 100)}
                      barStyle={themeProgressBar(theme)}
                    />
                  </div>
                )}
                <p className="theme-link text-sm">Ver mapa completo →</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {showSideQuests && sideQuestsPreview && (
          <Link href="/side-quests" className="block h-full">
            <Card className="theme-card-border theme-card-hover group h-full cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="theme-icon h-5 w-5" style={{ color: theme.colors.secondary }} />
                  {MANGA_COPY.sideQuestsNav}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-400">Opcionales, disponibles cuando quieras</p>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>Completadas hoy</span>
                    <span>
                      {sideQuestsPreview.completedSideQuests}/{sideQuestsPreview.totalSideQuests}
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (sideQuestsPreview.completedSideQuests / sideQuestsPreview.totalSideQuests) * 100
                    )}
                    barStyle={themeProgressBar(theme)}
                  />
                </div>
                <p className="theme-link text-sm">Ver misiones extra →</p>
              </CardContent>
            </Card>
          </Link>
        )}

        <div
          className={`h-full ${!showProgressCards ? "lg:max-w-xl" : showRoute && showSideQuests ? "lg:col-span-2" : ""}`}
        >
          <PowerGauge
            level={character.level}
            xpInLevel={character.xpProgress.xpInLevel}
            xpNeeded={character.xpProgress.xpNeeded}
            progress={character.xpProgress.progress}
          />
        </div>
      </div>

      <div>
        <h2 className="theme-section-title mb-4">Tus habilidades</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {character.skills.map((cs) => (
            <Card key={cs.id} className="p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <SkillIcon icon={cs.skill.icon} color={cs.skill.color} />
                <span className="text-sm font-medium">{cs.skill.name}</span>
                <Badge variant="default">Nv. {cs.level}</Badge>
                <Progress value={cs.xp % 100} className="h-1.5" color="bg-emerald-500" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {ranking.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-amber-400" />
              Ranking de la party
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ranking.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-xl p-3 ${
                  c.id === character.id ? "theme-highlight border" : "bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  <span className="font-medium">{c.name}</span>
                </div>
                <Badge variant="success">{c.weeklyPoints} pts</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
