import { getDashboardStats } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import { Users, Target, Zap, Gem } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Users className="h-8 w-8 text-violet-400" />
            <div>
              <CardTitle className="text-2xl">{stats.characters.length}</CardTitle>
              <p className="text-sm text-slate-400">Personajes</p>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Target className="h-8 w-8 text-emerald-400" />
            <div>
              <CardTitle className="text-2xl">{stats.missionsCompletedToday}</CardTitle>
              <p className="text-sm text-slate-400">Misiones hoy</p>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Zap className="h-8 w-8 text-amber-400" />
            <div>
              <CardTitle className="text-2xl">{stats.weeklyXp}</CardTitle>
              <p className="text-sm text-slate-400">XP semanal</p>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Gem className="h-8 w-8 text-cyan-400" />
            <div>
              <CardTitle className="text-2xl">{stats.totalCrystals}</CardTitle>
              <p className="text-sm text-slate-400">Cristales totales</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Personajes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.characters.map((character) => (
            <Card key={character.id}>
              <CardContent className="pt-6">
                <h3 className="font-bold">{character.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="info">Nv. {character.level}</Badge>
                  <Badge variant="warning">💎 {character.crystals}</Badge>
                  <Badge variant="success">{character.weeklyPoints} pts</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
