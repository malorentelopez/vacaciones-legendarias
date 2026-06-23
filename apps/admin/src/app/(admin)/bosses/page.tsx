import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBossBattles } from "@/actions/admin";
import { BossesManager } from "@/components/bosses-manager";

export default async function BossesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const bosses = await getBossBattles();
  return <BossesManager bosses={bosses} familyId={session.familyId} />;
}
