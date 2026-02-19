"use client";

import { GameCard } from "@/components/GameCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useHighlights } from "@/hooks/useHighlights";
import type { GameSummary } from "@/types/games";
import { formatDatePtBr } from "@/utils/date";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getCardRating(game: GameSummary) {
  if (typeof game.gameboxdRating !== "number") return undefined;
  return clamp(game.gameboxdRating, 0, 5);
}

export function HighlightsGrid() {
  const { data, isLoading, error } = useHighlights({ page: 1, pageSize: 6 });

  if (isLoading) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="overflow-hidden border-zinc-800 bg-zinc-900/40"
          >
            <div className="aspect-[16/9] w-full bg-zinc-800/50" />
            <CardHeader>
              <div className="h-5 w-3/4 rounded bg-zinc-800/60" />
              <div className="mt-3 h-4 w-24 rounded bg-zinc-800/50" />
              <div className="mt-3 h-4 w-full rounded bg-zinc-800/40" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-2/3 rounded bg-zinc-800/40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 text-sm text-zinc-400">
        Não foi possível carregar os destaques.
      </div>
    );
  }

  const games = data?.results ?? [];

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard
          key={game.id}
          title={game.name}
          description={
            game.released
              ? `Lançamento: ${formatDatePtBr(game.released) || game.released}`
              : undefined
          }
          siteRating={getCardRating(game)}
          metacritic={game.metacritic}
          genre="Em alta"
          genres={game.genres}
          showHeaderRatings={false}
          showReviewButton={false}
          imageUrl={game.background_image}
          detailsHref={`/games/${game.id}`}
        />
      ))}
    </div>
  );
}
