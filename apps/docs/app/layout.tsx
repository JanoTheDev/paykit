import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Paylix Docs", template: "%s — Paylix Docs" },
  description:
    "Accept USDC payments and subscriptions in your app with a few lines of TypeScript.",
};

const navItems = [
  { href: "/", label: "Getting Started" },
  { href: "/sdk-reference", label: "SDK Reference" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/self-hosting", label: "Self-Hosting" },
  { href: "/testnet", label: "Testnet Setup" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07070a] text-[#f0f0f3] antialiased min-h-screen">
        <div className="flex min-h-screen">
          <aside className="fixed left-0 top-0 h-screen w-60 border-r border-[rgba(148,163,184,0.08)] bg-[#0c0c10] p-4">
            <Link
              href="/"
              className="block text-base font-semibold text-[#f0f0f3] mb-8"
            >
              Paylix Docs
            </Link>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#111116] hover:text-[#f0f0f3] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="ml-60 flex-1 px-8 py-12 max-w-3xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
