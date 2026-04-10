import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface SectionProps extends SectionHeaderProps {
  children: ReactNode;
}

export function Section({ title, description, action, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title={title}
        description={description}
        action={action}
      />
      {children}
    </section>
  );
}
