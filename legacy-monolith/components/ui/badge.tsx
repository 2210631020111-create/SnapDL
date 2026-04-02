import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5",
    "text-xs font-medium w-fit whitespace-nowrap shrink-0",
    "[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
    "transition-colors duration-150",
    "overflow-hidden select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary/10 text-primary border border-primary/20",
          "dark:bg-primary/15 dark:text-primary dark:border-primary/25",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground border border-border/50",
        ].join(" "),
        destructive: [
          "bg-destructive/10 text-destructive border border-destructive/20",
          "dark:bg-destructive/15 dark:border-destructive/25",
        ].join(" "),
        outline: [
          "bg-transparent text-foreground border border-border",
          "dark:border-border/60",
        ].join(" "),
        success: [
          "bg-[oklch(0.52_0.18_145_/_0.12)] text-[oklch(0.40_0.18_145)]",
          "border border-[oklch(0.52_0.18_145_/_0.25)]",
          "dark:bg-[oklch(0.52_0.18_145_/_0.18)] dark:text-[oklch(0.72_0.18_145)]",
          "dark:border-[oklch(0.52_0.18_145_/_0.3)]",
        ].join(" "),
        warning: [
          "bg-[oklch(0.68_0.18_60_/_0.12)] text-[oklch(0.45_0.15_60)]",
          "border border-[oklch(0.68_0.18_60_/_0.25)]",
          "dark:bg-[oklch(0.68_0.18_60_/_0.15)] dark:text-[oklch(0.80_0.18_60)]",
          "dark:border-[oklch(0.68_0.18_60_/_0.3)]",
        ].join(" "),
        brand: [
          "brand-gradient text-white border-0",
          "shadow-[0_1px_4px_oklch(0.55_0.22_270_/_0.3)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
