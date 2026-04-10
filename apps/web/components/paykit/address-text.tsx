import { cn } from "@/lib/utils";
import { truncateAddress, explorerUrl } from "@/lib/format";

interface AddressTextProps {
  address: string;
  link?: boolean;
  className?: string;
}

export function AddressText({ address, link, className }: AddressTextProps) {
  const label = truncateAddress(address);
  const cls = cn(
    "font-mono tabular-nums text-foreground-muted",
    link && "transition-colors hover:text-primary",
    className,
  );
  if (link) {
    return (
      <a
        href={explorerUrl("address", address)}
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
