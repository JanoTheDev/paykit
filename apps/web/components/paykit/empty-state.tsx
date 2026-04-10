import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-foreground-dim">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="max-w-[320px] text-sm text-foreground-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
