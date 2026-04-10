import { Badge } from "@/components/ui/badge";

export function UsdcBadge({ symbol = "USDC" }: { symbol?: string }) {
  return <Badge variant="usdc">{symbol}</Badge>;
}
