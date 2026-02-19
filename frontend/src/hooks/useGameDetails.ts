"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { gamesService } from "@/services/games.service";
import type { GameDetails, GameDlc } from "@/types/games";
import type { Review } from "@/types/reviews";
import { getErrorMessage } from "@/utils/errors";

export function useGameDetails(gameId: string | number) {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [dlcs, setDlcs] = useState<GameDlc[] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!gameId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [gameRes, reviewsRes, dlcsRes] = await Promise.all([
        gamesService.getGameDetails(gameId),
        gamesService.getGameReviews(gameId),
        gamesService.getGameDlcs(gameId),
      ]);
      setGame(gameRes);
      setReviews(reviewsRes);
      setDlcs(dlcsRes);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const [gameRes, reviewsRes, dlcsRes] = await Promise.all([
          gamesService.getGameDetails(gameId),
          gamesService.getGameReviews(gameId),
          gamesService.getGameDlcs(gameId),
        ]);

        if (cancelled) return;
        setGame(gameRes);
        setReviews(reviewsRes);
        setDlcs(dlcsRes);
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
  }, [gameId]);

  return useMemo(
    () => ({ game, reviews, dlcs, isLoading, error, refetch: fetchAll }),
    [game, reviews, dlcs, isLoading, error, fetchAll]
  );
}
