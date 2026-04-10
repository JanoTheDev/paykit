import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KeyValueListItem {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

interface KeyValueListProps {
  items: KeyValueListItem[];
  className?: string;
}

export function KeyValueList({ items, className }: KeyValueListProps) {
  return (
    <dl className={cn("flex flex-col divide-y divide-border", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0"
        >
          <dt className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-right text-sm text-foreground",
              item.mono && "font-mono tabular-nums",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
