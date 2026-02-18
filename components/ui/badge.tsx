import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[0_0_10px_-2px_hsl(var(--primary)/0.5)]",
        secondary:
          "border-transparent bg-white/10 text-white backdrop-blur-md border border-white/10",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-white/20 bg-white/5 backdrop-blur-sm",
        neon: "border-primary/50 text-primary bg-primary/10 shadow-[0_0_8px_-1px_hsl(var(--primary)/0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
