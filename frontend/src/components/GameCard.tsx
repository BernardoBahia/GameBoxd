import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { StarDisplay } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface GameCardProps {
  title: string;
  description?: string;
  siteRating?: number; // 0..5 (RAWG)
  metacritic?: number; // 0..100
  genre: string;
  genres?: string[];
  showHeaderRatings?: boolean;
  showReviewButton?: boolean;
  imageUrl?: string;
  detailsHref?: string;
  className?: string;
}

function normalizeGenres(genres?: string[]) {
  if (!Array.isArray(genres)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const g of genres) {
    const name = String(g ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
    if (result.length >= 3) break;
  }
  return result;
}

function formatMetacritic(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return String(Math.round(value));
}

function metacriticColor(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return "border border-zinc-600 text-zinc-400";
  if (value >= 75)
    return "bg-emerald-900/50 text-emerald-300 border border-emerald-700/60";
  if (value >= 50)
    return "bg-amber-900/50 text-amber-300 border border-amber-700/60";
  return "bg-red-900/50 text-red-300 border border-red-700/60";
}


export function GameCard({
  title,
  description,
  siteRating,
  metacritic,
  genre,
  genres,
  showHeaderRatings = true,
  showReviewButton = true,
  imageUrl,
  detailsHref = "/games/1",
  className,
}: GameCardProps) {
  const genresToShow = normalizeGenres(genres);

  return (
    <Card
      className={cn(
        "group overflow-hidden border-zinc-800 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60",
        className,
      )}
    >
      {/* media placeholder */}
      <div
        className={cn(
          "aspect-[16/9] w-full bg-zinc-800/50 transition-colors group-hover:bg-zinc-800",
          imageUrl ? "bg-cover bg-center" : "",
        )}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="truncate">{title}</CardTitle>
          {showHeaderRatings ? (
            <div className="flex flex-col items-end gap-1.5">
              {typeof siteRating === "number" ? (
                <StarDisplay rating={siteRating} size="xs" />
              ) : null}
              <div
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
                  metacriticColor(metacritic),
                )}
                title="Nota Metacritic"
                aria-label={`Nota Metacritic ${formatMetacritic(metacritic)}`}
              >
                MC {formatMetacritic(metacritic)}
              </div>
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {genresToShow.length ? (
            genresToShow.map((g) => (
              <Badge key={g} variant="outline">
                {g}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">{genre}</Badge>
          )}
        </div>
        {description ? (
          <CardDescription className="mt-2">{description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent>
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">GameBoxd</span>
            {typeof siteRating === "number" ? (
              <StarDisplay rating={siteRating} size="xs" showNumber />
            ) : (
              <span className="text-sm text-zinc-500">—</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Metacritic</span>
            <span className="text-sm font-medium tabular-nums">
              {formatMetacritic(metacritic)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={cn(showReviewButton ? "justify-between" : "justify-center")}
      >
        <Button asChild variant="outline">
          <Link href={detailsHref}>Ver detalhes</Link>
        </Button>
        {showReviewButton ? (
          <Button asChild>
            <Link href={detailsHref}>Review</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
