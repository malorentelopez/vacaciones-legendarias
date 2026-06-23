import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  CharacterPortrait,
} from "@repo/ui";
import {
  Target,
  Zap,
  Gem,
  ShoppingBag,
  PackageCheck,
  Swords,
  Clock,
  AlertTriangle,
  CalendarDays,
  Gift,
  ChevronRight,
} from "lucide-react";
import { getCharacterPortraitSrc, getTheme } from "@repo/domain";
import type { EventType } from "@repo/database";

type TodayMissions =
  | { completed: number; total: number; isFreeDay: false; freeDayLabel: null }
  | { completed: number; total: number; isFreeDay: true; freeDayLabel: string | null };

interface DashboardCharacter {
  id: string;
  name: string;
  gender: "BOY" | "GIRL";
  themeKey: string;
  avatarBase: string;
  avatarConfig?: unknown;
  level: number;
  crystals: number;
  weeklyPoints: number;
  screenTimeMinutes: number;
  todayMissions: TodayMissions;
  xpProgress: { xpInLevel: number; xpNeeded: number; progress: number };
}

interface DashboardPurchase {
  id: string;
  purchasedAt: Date;
  reward: { title: string; crystalCost: number };
  character: { name: string };
}

interface DashboardEvent {
  id: string;
  type: EventType;
  payload: unknown;
  createdAt: Date;
  character: { name: string };
}

interface ParentDashboardProps {
  data: {
    characters: DashboardCharacter[];
    missionsCompletedToday: number;
    weeklyPointsTotal: number;
    totalCrystals: number;
    pendingPurchases: DashboardPurchase[];
    approvedPurchases: DashboardPurchase[];
    recentEvents: DashboardEvent[];
    currentBoss: {
      id: string;
      title: string;
      completedObjectives: number;
      totalObjectives: number;
    } | null;
  };
}

const EVENT_LABELS: Record<EventType, string> = {
  MISSION_COMPLETED: "Misión completada",
  XP_GAINED: "XP ganada",
  LEVEL_UP: "Subida de nivel",
  ACHIEVEMENT_UNLOCKED: "Logro desbloqueado",
  ACHIEVEMENT_CLAIMED: "Logro reclamado",
  CRYSTALS_GAINED: "Cristales ganados",
  CRYSTALS_SPENT: "Cristales gastados",
  BOSS_COMPLETED: "Reto del mes completado",
  PENALTY_APPLIED: "Penalización",
  WEEKLY_RESET: "Reset semanal",
  CHARACTER_CREATED: "Personaje creado",
  QUESTIONNAIRE_COMPLETED: "Cuestionario aprobado",
  SECRET_DISCOVERED: "Secreto descubierto",
  SECRET_COMPLETED: "Secreto completado",
  STREAK_MILESTONE: "Hito de racha",
  COMBO_MORNING: "Combo matinal",
};

function getGreeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function formatEventDetail(type: EventType, payload: unknown): string {
  const p = payload as Record<string, unknown> | null;
  if (!p) return "";

  switch (type) {
    case "MISSION_COMPLETED":
      return String(p.missionTitle ?? "");
    case "LEVEL_UP":
      return `Nivel ${p.newLevel ?? "?"}`;
    case "ACHIEVEMENT_UNLOCKED":
    case "ACHIEVEMENT_CLAIMED":
      return String(p.title ?? "");
    case "CRYSTALS_GAINED":
    case "CRYSTALS_SPENT":
      return `${p.amount ?? 0} 💎`;
    case "XP_GAINED":
      return `+${p.amount ?? 0} XP`;
    case "PENALTY_APPLIED":
      return `-${p.points ?? 0} pts`;
    case "BOSS_COMPLETED":
      return String(p.title ?? "");
    case "CHARACTER_CREATED":
      return String(p.name ?? "");
    case "QUESTIONNAIRE_COMPLETED":
      return String(p.questionnaireTitle ?? p.missionTitle ?? "");
    case "SECRET_DISCOVERED":
    case "SECRET_COMPLETED":
      if (p.secretKey === "dragon-chest") return "Cofre del dragón";
      if (p.secretKey === "manga-power-combo") return "Combo de poder manga";
      if (p.secretKey === "ocean-fishing") return "Pesca relámpago";
      return String(p.secretKey ?? "");
    case "STREAK_MILESTONE":
      return `${p.days ?? "?"} días · +${p.crystals ?? 0} 💎`;
    case "COMBO_MORNING":
      return `+${p.crystals ?? 0} 💎`;
    default:
      return "";
  }
}

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Target;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <CardTitle className="text-2xl">{value}</CardTitle>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </CardHeader>
    </Card>
  );
}

export function ParentDashboard({ data }: ParentDashboardProps) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hasActions = data.pendingPurchases.length > 0 || data.approvedPurchases.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{getGreeting(now.getHours())}</h1>
        <p className="mt-1 capitalize text-slate-400">{dateLabel}</p>
        <p className="mt-2 text-sm text-slate-500">
          Resumen de la familia: progreso de hoy, puntos semanales y acciones pendientes.
        </p>
      </div>

      {hasActions && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Requiere tu atención</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.pendingPurchases.length > 0 && (
              <Link href="/rewards">
                <Card className="border-amber-500/30 bg-amber-500/5 transition-colors hover:bg-amber-500/10">
                  <CardContent className="flex items-center justify-between gap-3 pt-6">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-8 w-8 text-amber-400" />
                      <div>
                        <p className="font-semibold">
                          {data.pendingPurchases.length} recompensa
                          {data.pendingPurchases.length === 1 ? "" : "s"} por aprobar
                        </p>
                        <p className="text-sm text-slate-400">
                          {data.pendingPurchases[0].character.name} · {data.pendingPurchases[0].reward.title}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
                  </CardContent>
                </Card>
              </Link>
            )}
            {data.approvedPurchases.length > 0 && (
              <Link href="/rewards">
                <Card className="border-cyan-500/30 bg-cyan-500/5 transition-colors hover:bg-cyan-500/10">
                  <CardContent className="flex items-center justify-between gap-3 pt-6">
                    <div className="flex items-center gap-3">
                      <PackageCheck className="h-8 w-8 text-cyan-400" />
                      <div>
                        <p className="font-semibold">
                          {data.approvedPurchases.length} por entregar
                        </p>
                        <p className="text-sm text-slate-400">
                          {data.approvedPurchases[0].character.name} · {data.approvedPurchases[0].reward.title}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          value={data.missionsCompletedToday}
          label="Misiones hoy"
          color="text-emerald-400"
        />
        <StatCard
          icon={Zap}
          value={data.weeklyPointsTotal}
          label="Puntos esta semana"
          color="text-amber-400"
        />
        <StatCard
          icon={Gem}
          value={data.totalCrystals}
          label="Cristales en familia"
          color="text-cyan-400"
        />
        <StatCard
          icon={ShoppingBag}
          value={data.pendingPurchases.length}
          label="Compras pendientes"
          color="text-violet-400"
        />
      </div>

      {data.currentBoss && data.currentBoss.totalObjectives > 0 && (
        <Link href="/bosses">
          <Card className="transition-colors hover:bg-slate-800/50">
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div className="flex items-center gap-3">
                <Swords className="h-8 w-8 text-rose-400" />
                <div>
                  <p className="font-semibold">Reto del mes: {data.currentBoss.title}</p>
                  <p className="text-sm text-slate-400">
                    {data.currentBoss.completedObjectives} de {data.currentBoss.totalObjectives} objetivos
                  </p>
                </div>
              </div>
              <div className="w-32">
                <Progress
                  value={
                    (data.currentBoss.completedObjectives / data.currentBoss.totalObjectives) * 100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">Tus hijos</h2>
        {data.characters.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-400">Aún no hay personajes. Crea el primero en Personajes.</p>
            <Link href="/characters" className="mt-3 inline-block text-sm text-violet-400 hover:underline">
              Ir a Personajes →
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.characters.map((character) => {
              const theme = getTheme(character.themeKey);
              const portraitSrc = getCharacterPortraitSrc(character);
              const missionProgress =
                character.todayMissions.total > 0
                  ? Math.round(
                      (character.todayMissions.completed / character.todayMissions.total) * 100
                    )
                  : 0;

              return (
                <Card key={character.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <CharacterPortrait
                        imageSrc={portraitSrc}
                        alt={character.name}
                        primaryColor={theme.colors.primary}
                        secondaryColor={theme.colors.secondary}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold">{character.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="info">Nv. {character.level}</Badge>
                          <Badge variant="warning">💎 {character.crystals}</Badge>
                          <Badge variant="success">{character.weeklyPoints} pts</Badge>
                          <Badge variant="default">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {character.screenTimeMinutes} min
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-slate-400">
                          <span>Progreso de nivel</span>
                          <span>
                            {character.xpProgress.xpInLevel}/{character.xpProgress.xpNeeded} XP
                          </span>
                        </div>
                        <Progress value={character.xpProgress.progress} className="h-1.5" />
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-xs text-slate-400">
                          <span>Ruta de hoy</span>
                          {character.todayMissions.isFreeDay ? (
                            <span className="text-emerald-400">
                              Día libre{character.todayMissions.freeDayLabel ? `: ${character.todayMissions.freeDayLabel}` : ""}
                            </span>
                          ) : (
                            <span>
                              {character.todayMissions.completed}/{character.todayMissions.total} misiones
                            </span>
                          )}
                        </div>
                        {!character.todayMissions.isFreeDay && (
                          <Progress value={missionProgress} className="h-1.5" color="bg-emerald-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Actividad reciente</h2>
            <Link href="/timeline" className="text-sm text-violet-400 hover:underline">
              Ver todo
            </Link>
          </div>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            {EVENT_LABELS[event.type] ?? event.type}
                          </Badge>
                          <span className="text-sm text-violet-400">{event.character.name}</span>
                        </div>
                        {detail && <p className="mt-1 truncate text-sm text-slate-400">{detail}</p>}
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

        <section>
          <h2 className="mb-4 text-xl font-bold">Accesos rápidos</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/schedule", icon: CalendarDays, label: "Agenda semanal" },
              { href: "/rewards", icon: Gift, label: "Recompensas" },
              { href: "/penalties", icon: AlertTriangle, label: "Penalizaciones" },
              { href: "/missions", icon: Target, label: "Misiones" },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Card className="transition-colors hover:bg-slate-800/50">
                  <CardContent className="flex items-center gap-3 pt-4">
                    <Icon className="h-5 w-5 text-violet-400" />
                    <span className="text-sm font-medium">{label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
