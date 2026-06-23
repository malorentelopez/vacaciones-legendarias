import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRewards } from "@/actions/admin";
import { RewardsManager } from "@/components/rewards-manager";

export default async function RewardsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rewards = await getRewards();
  return <RewardsManager rewards={rewards} familyId={session.familyId} />;
}
