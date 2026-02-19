"use client";

import { useEffect, useMemo, useState } from "react";

import { listsService } from "@/services/lists.service";
import type { List } from "@/types/lists";
import { getErrorMessage } from "@/utils/errors";

export function useLists(token?: string | null) {
  const [data, setData] = useState<List[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLists(currentToken?: string | null) {
    const result = await listsService.getLists(currentToken ?? undefined);
    setData(result);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listsService.getLists(token ?? undefined);
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
  }, [token]);

  const refetch = async () => {
    setError(null);
    try {
      await fetchLists(token ?? null);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return useMemo(
    () => ({ data, isLoading, error, refetch }),
    [data, isLoading, error]
  );
}

export function useListDetails(listId: string, token?: string | null) {
  const [data, setData] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchList(
    currentListId: string,
    currentToken?: string | null
  ) {
    const result = await listsService.getListById(
      currentListId,
      currentToken ?? undefined
    );
    setData(result);
  }

  useEffect(() => {
    if (!listId) return;
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listsService.getListById(
          listId,
          token ?? undefined
        );
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
  }, [listId, token]);

  const refetch = async () => {
    if (!listId) return;
    setError(null);
    try {
      await fetchList(listId, token ?? null);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return useMemo(
    () => ({ data, isLoading, error, refetch }),
    [data, isLoading, error]
  );
}
