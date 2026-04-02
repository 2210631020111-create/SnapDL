import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-xl border border-input px-3 py-2 text-sm",
        "bg-background text-foreground",
        "placeholder:text-muted-foreground/60",
        "dark:bg-input/20 dark:border-input/60",
        "shadow-[0_1px_2px_oklch(0_0_0_/_0.05)]",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none field-sizing-content",
        "dark:[color-scheme:dark]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
