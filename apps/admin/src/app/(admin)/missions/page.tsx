import { getMissions, getSkills } from "@/actions/admin";
import { MissionsManager } from "@/components/missions-manager";

export default async function MissionsPage() {
  const [missions, skills] = await Promise.all([getMissions(), getSkills()]);
  return <MissionsManager missions={missions} skills={skills} />;
}
