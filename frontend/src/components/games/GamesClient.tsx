"use client";

import { useEffect, useMemo, useState } from "react";

import { FilterBar } from "@/components/games/FilterBar";
import { GameGrid } from "@/components/games/GameGrid";
import { Pagination } from "@/components/games/Pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGenres } from "@/hooks/useGenres";
import { useGames } from "@/hooks/useGames";
import type { GameSummary } from "@/types/games";
import { formatDatePtBr } from "@/utils/date";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getCardRating(game: GameSummary) {
  if (typeof game.gameboxdRating !== "number") return undefined;
  return clamp(game.gameboxdRating, 0, 5);
}

function getOrdering(selected: "top" | undefined) {
  switch (selected) {
    case "top":
      return "-metacritic";
    default:
      return undefined;
  }
}

export function GamesClient() {
  const [page, setPage] = useState(1);
  const [selectedOrdering, setSelectedOrdering] = useState<"top" | undefined>(
    undefined,
  );

  const [selectedGenreId, setSelectedGenreId] = useState<string | undefined>(
    undefined,
  );

  const [searchText, setSearchText] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const pageSize = 12;

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(searchText.trim());
    }, 350);

    return () => clearTimeout(t);
  }, [searchText]);

  const params = useMemo(
    () => ({
      page,
      pageSize,
      query,
      genres: selectedGenreId,
      ordering: getOrdering(selectedOrdering),
    }),
    [page, pageSize, query, selectedGenreId, selectedOrdering],
  );

  const { data: genres } = useGenres();
  const { data, isLoading, error } = useGames(params);

  const totalPages = useMemo(() => {
    const count = data?.count ?? 0;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [data?.count, pageSize]);

  const selectedGenreName = useMemo(() => {
    if (!selectedGenreId) return undefined;
    return (genres ?? []).find((g) => String(g.id) === selectedGenreId)?.name;
  }, [genres, selectedGenreId]);

  const badgeLabel = query ? "Busca" : (selectedGenreName ?? "Geral");

  return (
    <>
      <FilterBar
        title="Jogos"
        searchValue={searchText}
        onSearchValueChange={(next) => {
          setSearchText(next);
          setPage(1);
        }}
        onSearchSubmit={() => {
          setQuery(searchText.trim());
          setPage(1);
        }}
        onSearchClear={() => {
          setSearchText("");
          setQuery("");
          setPage(1);
        }}
        genres={genres ?? undefined}
        selectedGenreId={selectedGenreId}
        onGenreChange={(next) => {
          setSelectedGenreId(next);
          setPage(1);
        }}
        selectedOrdering={selectedOrdering}
        onOrderingChange={(next) => {
          setSelectedOrdering((current) =>
            current === next ? undefined : next,
          );
          setPage(1);
        }}
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: pageSize }).map((_, index) => (
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
        ) : error ? (
          <div className="text-sm text-zinc-400">
            Não foi possível carregar os jogos.
          </div>
        ) : (data?.results?.length ?? 0) === 0 ? (
          <div className="text-sm text-zinc-400">
            {query
              ? `Nenhum jogo encontrado para "${query}".`
              : "Nenhum jogo encontrado."}
          </div>
        ) : (
          <GameGrid
            games={(data?.results ?? []).map((game) => ({
              title: game.name,
              description: game.released
                ? `Lançamento: ${
                    formatDatePtBr(game.released) || game.released
                  }`
                : undefined,
              siteRating: getCardRating(game),
              metacritic: game.metacritic,
              genre: badgeLabel,
              genres: game.genres,
              imageUrl: game.background_image,
              detailsHref: `/games/${game.id}`,
            }))}
            showHeaderRatings={false}
            showReviewButton={false}
          />
        )}
      </div>

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
