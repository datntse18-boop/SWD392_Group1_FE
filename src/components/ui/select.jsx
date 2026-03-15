import * as React from "react"

import { cn } from "@/lib/utils"

function Select({ className, children, ...props }) {
  return (
    <select
      data-slot="select"
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring focus:ring-offset-background h-9 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
