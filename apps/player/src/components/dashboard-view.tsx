import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Progress, Badge, SkillIcon, CharacterPortrait } from "@repo/ui";
import { Gem, Star, Zap, Crown, Map, Scroll } from "lucide-react";
import {
  getTheme,
  getRoleName,
  normalizeRoleKey,
  getCharacterPortraitSrc,
} from "@repo/domain";

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

export function DashboardView({
  character,
  familyCharacters = [],
  routePreview,
}: {
  character: CharacterData;
  familyCharacters?: FamilyCharacter[];
  routePreview?: RoutePreview;
}) {
  const ranking = [...familyCharacters].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(character.themeKey);
  const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);
  const roleName = getRoleName(character.themeKey, genderKey, roleKey);
  const portraitSrc = getCharacterPortraitSrc(character);

  return (
    <div className="space-y-6">
      <Card
        className="overflow-hidden border-violet-500/30"
        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}18 0%, transparent 60%)` }}
      >
        <CardContent className="p-6 text-center">
          <CharacterPortrait
            imageSrc={portraitSrc}
            alt={roleName}
            primaryColor={theme.colors.primary}
            secondaryColor={theme.colors.secondary}
            size="xl"
            className="mx-auto mb-4 ring-2 ring-violet-500/40"
          />
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Tu héroe</p>
          <h1 className="text-3xl font-bold" style={{ color: theme.colors.heading }}>
            {character.name}
          </h1>
          <p className="text-sm text-slate-400">{roleName} · {theme.name}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="info">
              <Star className="mr-1 inline h-3 w-3" />
              Nv. {character.level}
            </Badge>
            <Badge variant="warning">
              <Gem className="mr-1 inline h-3 w-3" />
              {character.crystals} 💎
            </Badge>
            <Badge variant="success">
              <Zap className="mr-1 inline h-3 w-3" />
              {character.weeklyPoints} pts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {routePreview && routePreview.totalStages > 0 && (
        <Link href="/ruta">
          <Card className="group cursor-pointer border-amber-500/20 transition-colors hover:border-violet-500/40 hover:bg-violet-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Map className="h-5 w-5 text-violet-400" />
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
                    <span>{routePreview.completedQuests}/{routePreview.totalQuests}</span>
                  </div>
                  <Progress
                    value={Math.round((routePreview.completedQuests / routePreview.totalQuests) * 100)}
                    color="bg-gradient-to-r from-amber-500 to-violet-500"
                  />
                </div>
              )}
              <p className="text-sm text-violet-400 group-hover:text-violet-300">Ver mapa completo →</p>
            </CardContent>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scroll className="h-5 w-5 text-emerald-400" />
            Experiencia de héroe
          </CardTitle>
          <p className="text-sm text-slate-400">
            {character.xpProgress.xpInLevel} / {character.xpProgress.xpNeeded} XP → Nv. {character.level + 1}
          </p>
        </CardHeader>
        <CardContent>
          <Progress value={character.xpProgress.progress} color="bg-gradient-to-r from-violet-500 to-emerald-500" />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-bold text-violet-300">Tus poderes</h2>
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
                  c.id === character.id ? "border border-violet-500/30 bg-violet-500/20" : "bg-slate-800/50"
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
