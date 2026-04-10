import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DocTableProps {
  children: ReactNode;
  className?: string;
}

export function DocTable({ children, className }: DocTableProps) {
  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-lg border border-border bg-surface-1",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function DocTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-surface-2">{children}</thead>
  );
}

export function DocTableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-border text-foreground">
      {children}
    </tbody>
  );
}

export function DocTableRow({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-surface-2/50">{children}</tr>;
}

export function DocTableHeader({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-medium uppercase tracking-wider text-foreground-dim",
        align === "left" ? "text-left" : "text-right",
      )}
    >
      {children}
    </th>
  );
}

export function DocTableCell({
  children,
  align = "left",
  mono = false,
}: {
  children: ReactNode;
  align?: "left" | "right";
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-top",
        align === "left" ? "text-left" : "text-right",
        mono && "font-mono text-xs",
      )}
    >
      {children}
    </td>
  );
}
