import { cn } from "@/lib/utils";
import { truncateHash, explorerUrl } from "@/lib/format";

interface HashTextProps {
  hash: string;
  link?: "tx" | "none";
  className?: string;
}

export function HashText({ hash, link = "tx", className }: HashTextProps) {
  const label = truncateHash(hash);
  const cls = cn(
    "font-mono tabular-nums text-foreground-muted",
    link === "tx" && "transition-colors hover:text-primary",
    className,
  );
  if (link === "tx") {
    return (
      <a
        href={explorerUrl("tx", hash)}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {label}
      </a>
    );
  }
  return <span className={cls}>{label}</span>;
}
