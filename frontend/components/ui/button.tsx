import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
    "transition-all duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
    "select-none cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "brand-gradient text-white rounded-xl",
          "shadow-[0_2px_8px_oklch(0.55_0.22_270_/_0.3)]",
          "hover:shadow-[0_4px_16px_oklch(0.55_0.22_270_/_0.4)] hover:brightness-110",
          "active:scale-[0.98] active:brightness-95",
        ].join(" "),
        destructive: [
          "bg-destructive text-white rounded-xl",
          "shadow-[0_2px_8px_oklch(0.57_0.22_25_/_0.25)]",
          "hover:bg-destructive/90 hover:shadow-[0_4px_16px_oklch(0.57_0.22_25_/_0.35)]",
          "active:scale-[0.98]",
          "focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40",
        ].join(" "),
        outline: [
          "border border-border bg-background rounded-xl text-foreground",
          "shadow-[0_1px_3px_oklch(0_0_0_/_0.06)]",
          "hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
          "hover:shadow-[0_2px_8px_oklch(0_0_0_/_0.08)]",
          "active:scale-[0.98]",
          "dark:bg-card dark:border-border dark:hover:bg-accent",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground rounded-xl",
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "rounded-xl text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
          "dark:hover:bg-accent/50",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline rounded-md",
        success: [
          "bg-[oklch(0.52_0.18_145)] text-white rounded-xl",
          "shadow-[0_2px_8px_oklch(0.52_0.18_145_/_0.3)]",
          "hover:brightness-110 hover:shadow-[0_4px_16px_oklch(0.52_0.18_145_/_0.4)]",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        default: "h-8 px-3 py-1.5 text-xs has-[>svg]:px-2.5",
        sm: "h-7 gap-1.5 px-2.5 text-[11px] has-[>svg]:px-2",
        lg: "h-11 px-6 text-base has-[>svg]:px-4",
        xl: "h-13 px-8 text-base has-[>svg]:px-6",
        icon: "size-8",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
