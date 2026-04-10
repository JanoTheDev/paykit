import { cn } from "@/lib/utils";
import { AlertCircle, Info, Lightbulb, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type CalloutVariant = "info" | "tip" | "warning" | "danger";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const STYLES: Record<CalloutVariant, { container: string; icon: string }> = {
  info: {
    container: "border-info/20 bg-info/5",
    icon: "text-info",
  },
  tip: {
    container: "border-primary/20 bg-primary/5",
    icon: "text-primary",
  },
  warning: {
    container: "border-warning/20 bg-warning/5",
    icon: "text-warning",
  },
  danger: {
    container: "border-destructive/20 bg-destructive/5",
    icon: "text-destructive",
  },
};

const ICONS: Record<CalloutVariant, typeof Info> = {
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export function Callout({
  variant = "info",
  title,
  children,
}: CalloutProps) {
  const style = STYLES[variant];
  const Icon = ICONS[variant];
  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4",
        style.container,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} />
      <div className="flex-1 text-sm leading-relaxed text-foreground">
        {title && <div className="mb-1 font-semibold">{title}</div>}
        <div className="text-foreground-muted">{children}</div>
      </div>
    </div>
  );
}
