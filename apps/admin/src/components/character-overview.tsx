import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CharacterPortrait,
  cn,
  Progress,
  SkillIcon,
} from "@repo/ui";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Flame,
  Gem,
  Pencil,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import {
  getCharacterPortraitSrc,
  getRoleName,
  getTheme,
  normalizeRoleKey,
} from "@repo/domain";
import { EVENT_LABELS, formatEventDetail, formatRelativeTime } from "@/lib/game-events";
import type { getCharacterProgressOverview } from "@/actions/admin";

type OverviewData = Awaited<ReturnType<typeof getCharacterProgressOverview>>;

function MissionRow({
  title,
  completed,
  xpReward,
  crystalReward,
}: {
  title: string;
  completed: boolean;
  xpReward: number;
  crystalReward?: number | null;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
        completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-700 bg-slate-800/40"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${completed ? "text-emerald-300" : "text-slate-200"}`}>
          {completed ? "✓ " : ""}
          {title}
        </p>
        <p className="text-xs text-slate-500">
          +{xpReward} XP{crystalReward ? ` · +${crystalReward} 💎` : ""}
        </p>
      </div>
      <Badge variant={completed ? "success" : "default"}>{completed ? "Hecha" : "Pendiente"}</Badge>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800/50 p-3 text-center">
      <Icon className={`mx-auto h-5 w-5 ${color}`} />
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function MetricTile({
  value,
  label,
  valueClassName,
}: {
  value: string | number;
  label: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-3 text-center">
      <p className={cn("text-2xl font-bold leading-tight", valueClassName)}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function CharacterOverview({ data }: { data: OverviewData }) {
  const { character } = data;
  const theme = getTheme(character.themeKey);
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const roleName = getRoleName(
    character.themeKey,
    genderKey,
    normalizeRoleKey(character.themeKey, character.avatarBase)
  );
  const portraitSrc = getCharacterPortraitSrc(character);

  const todayProgress =
    data.todayMissions.total > 0
      ? Math.round((data.todayMissions.completed / data.todayMissions.total) * 100)
      : 0;

  const weeklyProgress =
    data.weeklyMissions.length > 0
      ? Math.round((data.weeklyMissionsCompleted / data.weeklyMissions.length) * 100)
      : 0;

  const sideQuestProgress =
    data.sideQuests.length > 0
      ? Math.round((data.sideQuestsCompleted / data.sideQuests.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link href="/characters">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Personajes
          </Button>
        </Link>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          <CharacterPortrait
            imageSrc={portraitSrc}
            alt={character.name}
            primaryColor={theme.colors.primary}
            secondaryColor={theme.colors.secondary}
            size="xl"
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold">{character.name}</h1>
            <p className="text-violet-300">{roleName}</p>
            <p className="text-sm text-slate-400">
              {theme.name} · {character.gender === "BOY" ? "Chico" : "Chica"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="info">Nv. {character.level}</Badge>
              <Badge variant="warning">💎 {character.crystals}</Badge>
              <Badge variant="success">{character.weeklyPoints} pts semana</Badge>
              <Badge variant="default">
                <Clock className="mr-1 inline h-3 w-3" />
                {data.screenTimeMinutes} min pantalla
              </Badge>
              {data.streak?.current ? (
                <Badge variant="default">
                  <Flame className="mr-1 inline h-3 w-3 text-orange-400" />
                  Racha {data.streak.current} días
                </Badge>
              ) : null}
            </div>
          </div>
          <Link href="/characters">
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {character.xpProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Progreso al nivel {character.level + 1}</span>
              <span>
                {character.xpProgress.xpInLevel}/{character.xpProgress.xpNeeded} XP
              </span>
            </div>
            <Progress value={character.xpProgress.progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatTile icon={Target} label="Misiones hoy" value={data.missionsCompletedToday} color="text-emerald-400" />
        <StatTile icon={CalendarDays} label="Misiones semana" value={data.missionsCompletedThisWeek} color="text-sky-400" />
        <StatTile icon={Zap} label="XP total" value={character.xp} color="text-amber-400" />
        <StatTile icon={Gem} label="Cristales" value={character.crystals} color="text-cyan-400" />
        <StatTile icon={Trophy} label="Logros" value={data.achievementsCount} color="text-amber-400" />
        <StatTile icon={Star} label="Misiones totales" value={data.completedMissions} color="text-violet-400" />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Hoy</h2>
          <p className="text-sm capitalize text-slate-400">{data.todayDateLabel}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ruta del día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.todayMissions.isFreeDay ? (
              <p className="text-emerald-400">
                Día libre
                {data.todayMissions.freeDayLabel ? `: ${data.todayMissions.freeDayLabel}` : ""}
              </p>
            ) : data.agenda.isFreeDay === false && data.agenda.blocks.length === 0 ? (
              <p className="text-slate-400">Sin bloques configurados para hoy en la agenda.</p>
            ) : (
              <>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>Progreso de la ruta</span>
                    <span>
                      {data.todayMissions.completed}/{data.todayMissions.total} misiones
                    </span>
                  </div>
                  <Progress value={todayProgress} className="h-2" color="bg-emerald-500" />
                </div>

                {data.agenda.isFreeDay === false &&
                  data.agenda.blocks.map((block) => (
                    <div key={block.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-200">{block.title}</p>
                        <span className="text-xs text-slate-500">
                          {block.startTime}–{block.endTime}
                        </span>
                        {block.isCurrent ? <Badge variant="info">Ahora</Badge> : null}
                      </div>
                      <div className="space-y-2">
                        {block.missions.map((mission) => (
                          <MissionRow
                            key={mission.id}
                            title={mission.title}
                            completed={mission.completed}
                            xpReward={mission.xpReward}
                            crystalReward={mission.crystalReward}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </CardContent>
        </Card>

        {data.sideQuests.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Misiones extra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Completadas</span>
                  <span>
                    {data.sideQuestsCompleted}/{data.sideQuests.length}
                  </span>
                </div>
                <Progress value={sideQuestProgress} className="h-1.5" color="bg-violet-500" />
              </div>
              <div className="space-y-2">
                {data.sideQuests.map((mission) => (
                  <MissionRow
                    key={mission.id}
                    title={mission.title}
                    completed={mission.completed}
                    xpReward={mission.xpReward}
                    crystalReward={mission.crystalReward}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Esta semana</h2>
          <p className="text-sm text-slate-400">{data.weekKey}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            value={character.weeklyPoints}
            label="Puntos semanales"
            valueClassName="text-emerald-400"
          />
          <MetricTile
            value={data.screenTimeMinutes}
            label="Minutos de pantalla"
            valueClassName="text-sky-400"
          />
          <MetricTile
            value={data.weeklyMissionsCompleted}
            label="Misiones semanales hechas"
            valueClassName="text-amber-400"
          />
        </div>

        {data.weeklyMissions.length > 0 ? (
          <Card className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Misiones semanales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Progreso</span>
                  <span>
                    {data.weeklyMissionsCompleted}/{data.weeklyMissions.length}
                  </span>
                </div>
                <Progress value={weeklyProgress} className="h-2" color="bg-sky-500" />
              </div>
              <div className="space-y-2">
                {data.weeklyMissions.map((mission) => (
                  <MissionRow
                    key={mission.id}
                    title={mission.title}
                    completed={mission.completed}
                    xpReward={mission.xpReward}
                    crystalReward={mission.crystalReward}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-4 text-sm text-slate-400">No hay misiones con frecuencia semanal.</Card>
        )}

        {data.weeklyPenalty || data.recentPenalties.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Penalizaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.weeklyPenalty ? (
                <p className="text-sm text-red-300">
                  Esta semana: −{data.weeklyPenalty.points} pts
                  {data.weeklyPenalty.reason ? ` · ${data.weeklyPenalty.reason}` : ""}
                </p>
              ) : null}
              {data.recentPenalties.map((penalty) => (
                <div
                  key={penalty.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm"
                >
                  <span className="text-red-300">−{penalty.points} pts</span>
                  <span className="truncate text-slate-400">{penalty.reason ?? "Sin motivo"}</span>
                  <time className="shrink-0 text-xs text-slate-500">
                    {formatRelativeTime(penalty.appliedAt)}
                  </time>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </section>

      {character.skills && character.skills.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Habilidades</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {character.skills.map((entry) => (
              <div
                key={entry.skill.id}
                className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2.5"
              >
                <SkillIcon icon={entry.skill.icon} color={entry.skill.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{entry.skill.name}</p>
                  <p className="text-xs text-slate-400">
                    Nv. {entry.level} · {entry.xp} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Actividad reciente</h2>
        <div className="space-y-2">
          {data.recentEvents.length === 0 ? (
            <Card className="p-4 text-center text-sm text-slate-400">Sin actividad todavía</Card>
          ) : (
            data.recentEvents.map((event) => {
              const detail = formatEventDetail(event.type, event.payload);
              return (
                <Card key={event.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge variant="default" className="text-xs">
                        {EVENT_LABELS[event.type] ?? event.type}
                      </Badge>
                      {detail ? <p className="mt-1 truncate text-sm text-slate-400">{detail}</p> : null}
                    </div>
                    <time className="shrink-0 text-xs text-slate-500">
                      {formatRelativeTime(event.createdAt)}
                    </time>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
