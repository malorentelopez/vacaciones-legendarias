import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRewards, getRewardPurchases } from "@/actions/admin";
import { RewardsManager } from "@/components/rewards-manager";

export default async function RewardsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rewards, purchases] = await Promise.all([getRewards(), getRewardPurchases()]);
  return (
    <RewardsManager
      rewards={rewards}
      purchases={purchases}
      familyId={session.familyId}
    />
  );
}
