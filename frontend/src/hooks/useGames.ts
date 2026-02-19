"use client";

import { useEffect, useMemo, useState } from "react";

import { gamesService } from "@/services/games.service";
import type { GameSummary, PagedResponse } from "@/types/games";
import { getErrorMessage } from "@/utils/errors";

export interface UseGamesParams {
  page?: number;
  pageSize?: number;
  platforms?: string;
  genres?: string;
  dates?: string;
  ordering?: string;
  query?: string;
}

export function useGames(params: UseGamesParams) {
  const [data, setData] = useState<PagedResponse<GameSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const q = params.query?.trim();
        const result = q
          ? await gamesService.searchGames({
              query: q,
              page: params.page,
              pageSize: params.pageSize,
              ordering: params.ordering,
              genres: params.genres,
            })
          : await gamesService.getGames(params);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    params.page,
    params.pageSize,
    params.platforms,
    params.genres,
    params.dates,
    params.ordering,
    params.query,
  ]);

  return useMemo(() => ({ data, isLoading, error }), [data, isLoading, error]);
}
