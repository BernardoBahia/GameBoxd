import { cn } from "@/lib/utils";

export interface RatingBadgeProps {
  rating: number;
  className?: string;
}

function formatRating(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "-";
}

function ratingColor(rating: number) {
  if (rating >= 4.0)
    return "bg-emerald-900/50 text-emerald-300 border border-emerald-700/60";
  if (rating >= 3.0)
    return "bg-amber-900/50 text-amber-300 border border-amber-700/60";
  return "bg-red-900/50 text-red-300 border border-red-700/60";
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
        ratingColor(rating),
        className,
      )}
      aria-label={`Nota ${formatRating(rating)}`}
      title={`Nota ${formatRating(rating)}`}
    >
      {formatRating(rating)}
    </div>
  );
}
