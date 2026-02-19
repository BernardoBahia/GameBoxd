"use client";

import { useEffect, useMemo, useState } from "react";

import { gamesService } from "@/services/games.service";
import type { GenreSummary } from "@/types/genres";
import { getErrorMessage } from "@/utils/errors";

export function useGenres() {
  const [data, setData] = useState<GenreSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await gamesService.getGenres();
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
  }, []);

  return useMemo(() => ({ data, isLoading, error }), [data, isLoading, error]);
}
