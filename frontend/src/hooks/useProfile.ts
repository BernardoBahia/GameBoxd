"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { profileService } from "@/services/profile.service";
import type { MeResponse, UserStatsResponse } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";

export function useProfile(token?: string | null) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [updateBioError, setUpdateBioError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setMe(null);
      setStats(null);
      setIsLoading(false);
      return;
    }

    const authToken = token;

    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const meRes = await profileService.getMe(authToken);
        if (cancelled) return;
        setMe(meRes);

        const statsRes = await profileService.getUserStats(meRes.id, authToken);
        if (cancelled) return;
        setStats(statsRes);
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

  const updateBio = useCallback(
    async (bio: string | null) => {
      if (!token) throw new Error("Token não fornecido");
      setIsUpdatingBio(true);
      setUpdateBioError(null);
      try {
        const updated = await profileService.updateBio(bio, token);
        setMe(updated);
        return updated;
      } catch (e) {
        const msg = getErrorMessage(e);
        setUpdateBioError(msg);
        throw e;
      } finally {
        setIsUpdatingBio(false);
      }
    },
    [token],
  );

  return useMemo(
    () => ({
      me,
      stats,
      isLoading,
      error,
      updateBio,
      isUpdatingBio,
      updateBioError,
    }),
    [me, stats, isLoading, error, updateBio, isUpdatingBio, updateBioError],
  );
}
