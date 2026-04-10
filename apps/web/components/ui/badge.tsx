import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.3px] whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-primary/30 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary",
        secondary:
          "border-border bg-accent text-muted-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        outline: "border-border text-foreground",
        success:
          "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]",
        warning:
          "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
        info:
          "border-[color:var(--info)]/30 bg-[color:var(--info)]/10 text-[color:var(--info)]",
        usdc:
          "border-[color:var(--usdc)]/30 bg-[color:var(--usdc)]/10 text-[color:var(--usdc)] font-mono rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
