import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
        info: "border-blue-500/30 bg-blue-500/15 text-blue-400",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-400",
        destructive: "border-red-500/30 bg-red-500/15 text-red-400",
        outline: "border-border bg-transparent text-foreground",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant, ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
