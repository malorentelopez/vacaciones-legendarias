import { notFound } from "next/navigation";
import { getCharacterProgressOverview } from "@/actions/admin";
import { CharacterOverview } from "@/components/character-overview";

export default async function CharacterOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const data = await getCharacterProgressOverview(id);
    return <CharacterOverview data={data} />;
  } catch {
    notFound();
  }
}
