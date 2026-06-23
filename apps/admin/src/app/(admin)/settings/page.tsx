import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccountProfile } from "@/actions/settings";
import { AccountSettings } from "@/components/account-settings";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getAccountProfile();

  return <AccountSettings initialName={profile.name} initialEmail={profile.email} />;
}
