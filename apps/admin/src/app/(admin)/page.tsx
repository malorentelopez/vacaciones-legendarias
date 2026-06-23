import { getParentDashboard } from "@/actions/admin";
import { ParentDashboard } from "@/components/parent-dashboard";

export default async function AdminDashboardPage() {
  const data = await getParentDashboard();
  return <ParentDashboard data={data} />;
}
