import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav userName={session.name} />
      <main className="flex-1 px-4 pb-24 pt-16 lg:p-8 lg:pb-8 lg:pt-8">{children}</main>
    </div>
  );
}
