"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { gamesService } from "@/services/games.service";
import type { GameSummary, PagedResponse } from "@/types/games";
import { getErrorMessage } from "@/utils/errors";

export function useHighlights(params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const isMountedRef = useRef(true);

  const [data, setData] = useState<PagedResponse<GameSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamesService.getHighlights(page, pageSize);
      if (isMountedRef.current) setData(result);
    } catch (e) {
      if (isMountedRef.current) setError(getErrorMessage(e));
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return useMemo(
    () => ({ data, isLoading, error, refetch: fetchData }),
    [data, isLoading, error, fetchData]
  );
}
