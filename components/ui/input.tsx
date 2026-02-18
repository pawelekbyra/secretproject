import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "white";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm px-4 py-3 text-base ring-offset-background",
          variant === "default" && "border-white/10 bg-zinc-950/50 text-white placeholder:text-zinc-500 focus-visible:border-primary/50",
          variant === "white" && "border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-zinc-200 focus-visible:shadow-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
