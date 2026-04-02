import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base layout
        "h-8 w-full min-w-0 rounded-lg border px-2.5 py-1.5 text-xs",
        // Colors
        "bg-background text-foreground border-input",
        "placeholder:text-muted-foreground/60",
        // Dark mode
        "dark:bg-input/20 dark:border-input/60",
        // Shadow for depth
  "shadow-[0_1px_2px_oklch(0_0_0_/_0.04)]",
        // Transitions
        "transition-all duration-150 ease-out",
        // Focus state
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20",
        "dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/15",
        // Invalid state
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // File input
  "file:text-foreground file:border-0 file:bg-transparent file:text-xs file:font-medium",
        // Date input calendar icon
        "dark:[color-scheme:dark]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
