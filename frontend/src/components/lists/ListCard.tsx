import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListCardProps {
  name: string;
  description?: string;
  gamesCount: number;
  imageUrls?: string[];
  href?: string;
  className?: string;
}

export function ListCard({
  name,
  description,
  gamesCount,
  imageUrls,
  href = "/lists/1",
  className,
}: ListCardProps) {
  const images = Array.from({ length: 3 }).map((_, index) =>
    imageUrls?.[index] ? String(imageUrls[index]) : null
  );

  return (
    <Card
      className={cn(
        "group border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-50">
              {name}
            </p>
            {description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                {description}
              </p>
            ) : null}
            <p className="mt-3 text-xs font-medium tracking-wide text-zinc-500">
              {gamesCount} jogos
            </p>
          </div>

          <div className="shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={href}>Acessar</Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-zinc-800/70" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square overflow-hidden rounded-lg bg-zinc-800/60 transition-colors group-hover:bg-zinc-800",
                imageUrl ? "bg-cover bg-center" : ""
              )}
              style={
                imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined
              }
              aria-hidden
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
