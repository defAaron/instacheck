import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border border-foreground bg-transparent px-2.5 py-1 font-sans text-[10px] tracking-[0.16em] text-foreground uppercase",
        className,
      )}
      {...props}
    />
  )
}
