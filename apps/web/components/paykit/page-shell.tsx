import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  size?: "default" | "sm";
  className?: string;
}

export function PageShell({
  children,
  size = "default",
  className,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-8 py-10",
        size === "default" && "max-w-[1200px]",
        size === "sm" && "max-w-[720px]",
        className,
      )}
    >
      <div className="flex flex-col gap-10">{children}</div>
    </main>
  );
}
