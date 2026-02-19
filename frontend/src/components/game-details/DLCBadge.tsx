import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DLCType = "Expansion" | "Story DLC" | "Included";

export interface DLCBadgeProps {
  type: DLCType;
  className?: string;
}

export function DLCBadge({ type, className }: DLCBadgeProps) {
  const variant =
    type === "Expansion"
      ? "default"
      : type === "Story DLC"
      ? "secondary"
      : "outline";

  return (
    <Badge
      variant={variant}
      className={cn("uppercase tracking-wide", className)}
      title={type}
    >
      {type}
    </Badge>
  );
}
