import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  delta?: { value: string; positive?: boolean };
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
  delta,
}: MetricCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
          {label}
        </span>
        {icon && <span className="text-foreground-dim">{icon}</span>}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      {(hint || delta) && (
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          {delta && (
            <span
              className={cn(
                "font-medium",
                delta.positive ? "text-success" : "text-destructive",
              )}
            >
              {delta.positive ? "+" : ""}
              {delta.value}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}

interface MetricGridProps {
  children: ReactNode;
}

export function MetricGrid({ children }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
