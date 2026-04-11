import { getActiveOrgOrRedirect } from "@/lib/require-active-org";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getActiveOrgOrRedirect();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <div className="min-h-screen lg:ml-60">{children}</div>
    </div>
  );
}
