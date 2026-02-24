import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-black tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_20px_-5px_hsl(var(--primary)/0.3)] hover:shadow-[0_15px_25px_-5px_hsl(var(--primary)/0.4)] hover:translate-y-[-2px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20",
        outline:
          "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/40",
        outlineWhite:
          "border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:border-white shadow-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-primary/5 text-foreground/60 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/40 backdrop-blur-lg border border-white/20 text-foreground hover:bg-white/60 shadow-md",
      },
      size: {
        default: "h-14 px-8 py-4",
        sm: "h-10 rounded-xl px-4",
        lg: "h-16 rounded-[2rem] px-12 text-base",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
