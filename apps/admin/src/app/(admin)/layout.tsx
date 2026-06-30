import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { cn, mobileMainBottomClassLg, mobileMainTopClass } from "@repo/ui";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "PARENT") redirect("/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav userName={session.name} />
      <main className={cn("flex-1 px-4 lg:p-8 lg:pb-8 lg:pt-8", mobileMainBottomClassLg, mobileMainTopClass)}>
        {children}
      </main>
    </div>
  );
}
