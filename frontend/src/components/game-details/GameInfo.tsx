import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface GameInfoProps {
  title: string;
  releaseDateLabel: string;
  siteRating?: number; // 0..5
  metacritic?: number; // 0..100
  genres: string[];
  developers?: string[];
  publishers?: string[];
  className?: string;
}

function formatSiteRating(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return value.toFixed(1);
}

function formatMetacritic(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return String(Math.round(value));
}

export function GameInfo({
  title,
  releaseDateLabel,
  siteRating,
  metacritic,
  genres,
  developers,
  publishers,
  className,
}: GameInfoProps) {
  const hasDevelopers = Array.isArray(developers) && developers.length > 0;
  const hasPublishers = Array.isArray(publishers) && publishers.length > 0;

  return (
    <Card className={cn("border-zinc-800", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="leading-snug">{title}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className="tabular-nums"
              title="Nota do site"
            >
              GameBoxd {formatSiteRating(siteRating)}
            </Badge>
            <Badge
              variant="outline"
              className="tabular-nums"
              title="Nota Metacritic"
            >
              MC {formatMetacritic(metacritic)}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-400">{releaseDateLabel}</p>
      </CardHeader>
      <CardContent>
        <p className="text-xs font-medium tracking-wide text-zinc-500">
          Gêneros
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge key={genre} variant="outline" title={genre}>
              {genre}
            </Badge>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500">
              Desenvolvedora
            </p>
            {hasDevelopers ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {developers!.map((name) => (
                  <Badge key={name} variant="outline" title={name}>
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-200">—</p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500">
              Distribuidora
            </p>
            {hasPublishers ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {publishers!.map((name) => (
                  <Badge key={name} variant="outline" title={name}>
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-200">—</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
