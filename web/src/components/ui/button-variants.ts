import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none text-[11px] font-medium tracking-[0.18em] uppercase whitespace-nowrap transition-colors outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.25]",
  {
    variants: {
      variant: {
        default:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        solid:
          "border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:underline underline-offset-4",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-11 px-6",
        icon: "size-8 px-0 tracking-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
