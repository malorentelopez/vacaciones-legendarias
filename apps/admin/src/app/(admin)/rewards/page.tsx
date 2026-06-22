import { getRewards } from "@/actions/admin";
import { RewardsManager } from "@/components/rewards-manager";

export default async function RewardsPage() {
  const rewards = await getRewards();
  return <RewardsManager rewards={rewards} />;
}
