import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface-1 p-6",
        className,
      )}
    >
      <div className="mb-6 flex flex-col gap-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

interface FormRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FormRow({ label, description, htmlFor, children }: FormRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[200px_1fr] sm:items-start sm:gap-6">
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-foreground-muted">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface FormActionsProps {
  children: ReactNode;
}

export function FormActions({ children }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
      {children}
    </div>
  );
}
