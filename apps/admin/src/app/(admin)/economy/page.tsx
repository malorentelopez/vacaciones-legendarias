import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEconomyProjection } from "@/actions/admin";
import { EconomyDashboard } from "@/components/economy-dashboard";

export default async function EconomyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const projection = await getEconomyProjection();
  return <EconomyDashboard projection={projection} />;
}
