import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  description?: ReactNode;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-3 border-b border-border pb-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-base leading-relaxed text-foreground-muted">
          {description}
        </p>
      )}
    </div>
  );
}
