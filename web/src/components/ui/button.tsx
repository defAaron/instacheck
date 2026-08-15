import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  buttonVariants,
  type ButtonVariantProps,
} from "@/components/ui/button-variants"

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
