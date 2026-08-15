import type { InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-none border border-foreground bg-transparent px-3 text-sm text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className,
      )}
      {...props}
    />
  )
}
