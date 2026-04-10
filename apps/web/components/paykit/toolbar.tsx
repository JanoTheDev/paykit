import type { ReactNode } from "react";

interface ToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  action?: ReactNode;
}

export function Toolbar({ search, filters, action }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {search && <div className="min-w-[240px] flex-1">{search}</div>}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
