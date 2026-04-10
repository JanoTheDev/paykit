import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";

interface AmountProps {
  cents: number;
  withBadge?: boolean;
  align?: "left" | "right";
  className?: string;
}

export function Amount({
  cents,
  withBadge = false,
  align = "left",
  className,
}: AmountProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        align === "right" && "justify-end",
        className,
      )}
    >
      <span className="font-mono tabular-nums font-medium">
        {formatAmount(cents)}
      </span>
      {withBadge && <UsdcPill />}
    </div>
  );
}

function UsdcPill() {
  return (
    <span className="inline-flex items-center rounded-sm bg-usdc/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-usdc ring-1 ring-inset ring-usdc/20">
      USDC
    </span>
  );
}
