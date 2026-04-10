"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Getting Started" },
  { href: "/sdk-reference", label: "SDK Reference" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/self-hosting", label: "Self-Hosting" },
  { href: "/testnet", label: "Testnet Setup" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Link href="/" className="text-base font-semibold">
          Paylix Docs
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-2 hover:text-foreground"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 top-14 z-20 bg-background lg:hidden">
          <nav className="px-2 py-4">
            {navItems.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-11 items-center rounded-lg px-4 text-sm transition-colors",
                    active
                      ? "bg-surface-3 text-foreground"
                      : "text-foreground-muted hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
