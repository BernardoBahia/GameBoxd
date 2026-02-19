import { RatingBadge } from "@/components/RatingBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ReviewCardProps {
  username: string;
  dateLabel: string;
  rating: number;
  title: string;
  content: string;
  className?: string;
}

export function ReviewCard({
  username,
  dateLabel,
  rating,
  title,
  content,
  className,
}: ReviewCardProps) {
  return (
    <Card
      className={cn(
        "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{title}</CardTitle>
            <CardDescription className="mt-2">
              <span className="text-zinc-300">{username}</span>
              <span className="px-2 text-zinc-600">•</span>
              <span>{dateLabel}</span>
            </CardDescription>
          </div>
          <RatingBadge rating={rating} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-zinc-200">{content}</p>
      </CardContent>
    </Card>
  );
}
