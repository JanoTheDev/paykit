import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070a]">
      <Sidebar />
      <main className="ml-60 min-h-screen p-6">
        <div className="mx-auto max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
}
