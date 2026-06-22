import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AdminNav userName={session.name} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
