import { Card, CardContent, CardHeader, CardTitle, Progress, Badge, SkillIcon, CharacterPortrait } from "@repo/ui";
import { Gem, Star, Zap, Crown } from "lucide-react";
import { getTheme, getRoleName, normalizeRoleKey } from "@repo/domain";

interface CharacterData {
  id: string;
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
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

export function DashboardView({
  character,
  familyCharacters = [],
}: {
  character: CharacterData;
  familyCharacters?: FamilyCharacter[];
}) {
  const ranking = [...familyCharacters].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const theme = getTheme(character.themeKey);
  const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);
  const roleName = getRoleName(character.themeKey, genderKey, roleKey);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CharacterPortrait
          roleKey={roleKey}
          gender={genderKey}
          primaryColor={theme.colors.primary}
          secondaryColor={theme.colors.secondary}
          size="xl"
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold" style={{ color: "var(--theme-heading, #c4b5fd)" }}>
          {character.name}
        </h1>
        <p className="text-sm text-slate-400">{roleName}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <Badge variant="info">
            <Star className="mr-1 inline h-3 w-3" />
            Nivel {character.level}
          </Badge>
          <Badge variant="warning">
            <Gem className="mr-1 inline h-3 w-3" />
            {character.crystals} cristales
          </Badge>
          <Badge variant="success">
            <Zap className="mr-1 inline h-3 w-3" />
            {character.weeklyPoints} pts semana
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experiencia</CardTitle>
          <p className="text-sm text-slate-400">
            {character.xpProgress.xpInLevel} / {character.xpProgress.xpNeeded} XP para nivel {character.level + 1}
          </p>
        </CardHeader>
        <CardContent>
          <Progress value={character.xpProgress.progress} color="bg-gradient-to-r from-violet-500 to-emerald-500" />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-bold">Habilidades</h2>
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
              Ranking familiar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ranking.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-xl p-3 ${
                  c.id === character.id ? "bg-violet-500/20 border border-violet-500/30" : "bg-slate-800/50"
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
