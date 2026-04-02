"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 w-fit items-center justify-center rounded-xl p-1",
        "bg-muted/60 dark:bg-muted/40",
        "border border-border/50 dark:border-border/30",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Layout
        "inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5",
        "whitespace-nowrap rounded-lg text-sm font-medium",
        // Colors base
        "text-muted-foreground",
        // Transitions
        "transition-all duration-150 ease-out",
        // Active state
        "data-[state=active]:bg-background data-[state=active]:text-foreground",
        "data-[state=active]:shadow-[0_1px_4px_oklch(0_0_0_/_0.10)]",
        "dark:data-[state=active]:bg-card dark:data-[state=active]:text-foreground",
        "dark:data-[state=active]:shadow-[0_1px_4px_oklch(0_0_0_/_0.35)]",
        // Hover (non-active)
        "hover:text-foreground/80",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // SVG
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
