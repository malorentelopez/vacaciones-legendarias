import { MissionService, ScheduleService } from "@repo/domain";
import { getPrismaClient, runWithQueryMetrics } from "@repo/database/prisma";

type Scenario = {
  name: string;
  run: (characterId: string, familyId: string) => Promise<unknown>;
};

async function main() {
  const prisma = getPrismaClient();
  const character = await prisma.character.findFirst({
    select: { id: true, familyId: true, name: true },
  });

  if (!character) {
    console.error("No character found. Run: pnpm db:seed:demo");
    process.exit(1);
  }

  const scenarios: Scenario[] = [
    {
      name: "getAgendaForCharacter",
      run: (characterId) => new ScheduleService().getAgendaForCharacter(characterId),
    },
    {
      name: "getMissionsForCharacter",
      run: (characterId, familyId) =>
        new MissionService().getMissionsForCharacter(characterId, familyId),
    },
    {
      name: "getSideQuestsForCharacter",
      run: (characterId, familyId) =>
        new MissionService().getSideQuestsForCharacter(characterId, familyId),
    },
    {
      name: "getCharacterMissionOverview",
      run: (characterId, familyId) =>
        new MissionService().getCharacterMissionOverview(characterId, familyId),
    },
    {
      name: "getTodayMissionSummariesForFamily",
      run: (_characterId, familyId) =>
        new ScheduleService().getTodayMissionSummariesForFamily(familyId),
    },
  ];

  console.log(`Benchmarking domain queries for character "${character.name}" (${character.id})\n`);

  for (const scenario of scenarios) {
    const start = performance.now();
    const { metrics } = await runWithQueryMetrics(() =>
      scenario.run(character.id, character.familyId)
    );
    const elapsedMs = performance.now() - start;

    console.log(`${scenario.name}: ${metrics.queryCount} queries, ${elapsedMs.toFixed(0)}ms`);
    if (metrics.queries.length > 0) {
      console.log(`  queries: ${metrics.queries.join(", ")}`);
    }
    console.log();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrismaClient().$disconnect();
  });
