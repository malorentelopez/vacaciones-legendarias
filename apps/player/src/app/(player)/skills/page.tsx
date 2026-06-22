import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { Card, SkillIcon, Progress, Badge } from "@repo/ui";

export default async function SkillsPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const character = await getCharacter();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-violet-300">Tus poderes</h1>
      <p className="text-slate-400">Entrena cada habilidad para hacerte más fuerte</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {character.skills.map((cs) => (
          <Card key={cs.id} className="p-6">
            <div className="flex items-start gap-4">
              <SkillIcon icon={cs.skill.icon} color={cs.skill.color} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-bold">{cs.skill.name}</h3>
                <div className="mt-1 flex gap-2">
                  <Badge variant="info">Nivel {cs.level}</Badge>
                  <Badge variant="default">{cs.xp} XP</Badge>
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-xs text-slate-400">Progreso al siguiente nivel</p>
                  <Progress value={cs.xp % 100} color="bg-emerald-500" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
