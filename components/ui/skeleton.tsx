import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-white/5 animate-pulse flex items-center justify-center border border-white/5", className)}
      {...props}
    >
      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
      <Loader2 className="absolute h-6 w-6 text-white/10 animate-spin" />
    </div>
  )
}

export { Skeleton }
