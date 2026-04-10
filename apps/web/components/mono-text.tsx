import { cn } from "@/lib/utils";

interface MonoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  address?: boolean;
  hash?: boolean;
  children: React.ReactNode;
}

function truncate(s: string, prefix = 6, suffix = 4): string {
  if (s.length <= prefix + suffix + 3) return s;
  return `${s.slice(0, prefix)}...${s.slice(-suffix)}`;
}

export function MonoText({
  address,
  hash,
  children,
  className,
  ...props
}: MonoTextProps) {
  let content = children;
  if ((address || hash) && typeof children === "string") {
    content = truncate(children);
  }
  return (
    <span className={cn("font-mono tabular-nums", className)} {...props}>
      {content}
    </span>
  );
}
