import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface RatingBadgeProps {
  rating: number;
  className?: string;
}

function formatRating(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "-";
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  const tone =
    rating >= 4.0 ? "default" : rating >= 3.0 ? "secondary" : "outline";

  return (
    <Badge
      variant={tone}
      className={cn("tabular-nums", className)}
      aria-label={`Nota ${formatRating(rating)}`}
      title={`Nota ${formatRating(rating)}`}
    >
      {formatRating(rating)}
    </Badge>
  );
}
