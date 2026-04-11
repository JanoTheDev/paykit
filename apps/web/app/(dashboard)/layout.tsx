import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const activeOrgId = (session.session as { activeOrganizationId?: string | null })
    .activeOrganizationId;
  if (!activeOrgId) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <div className="min-h-screen lg:ml-60">{children}</div>
    </div>
  );
}
