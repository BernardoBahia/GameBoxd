"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GameCard } from "@/components/GameCard";
import { ReviewCard } from "@/components/game-details/ReviewCard";
import { EmptyState } from "@/components/lists/EmptyState";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLists } from "@/hooks/useLists";
import { useProfile } from "@/hooks/useProfile";
import { gamesService } from "@/services/games.service";
import { reviewsService } from "@/services/reviews.service";
import type { GameDetails } from "@/types/games";
import type { Review } from "@/types/reviews";
import { getErrorMessage } from "@/utils/errors";
import { formatDatePtBr } from "@/utils/date";

function emailToHandle(email?: string | null) {
  if (!email) return "@user";
  const local = email.split("@")[0] ?? "user";
  return `@${local}`;
}

function formatReleaseDatePtBr(dateIso?: string | null) {
  if (!dateIso) return "";
  const trimmed = dateIso.trim();
  if (!trimmed) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return formatDatePtBr(trimmed) || trimmed;
}

const FAVORITES_PAGE_SIZE = 12;
const FAVORITES_COLLAPSED_SIZE = 3;
const BIO_MAX_LENGTH = 280;
const REVIEWS_COLLAPSED_SIZE = 2;
const LISTS_COLLAPSED_SIZE = 3;

function FavoriteCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20 animate-pulse">
      <div className="aspect-[16/9] w-full bg-zinc-800/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-zinc-800/60" />
        <div className="h-3 w-1/2 rounded bg-zinc-800/40" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-20 rounded bg-zinc-800/40" />
          <div className="h-5 w-24 rounded bg-zinc-800/40" />
        </div>
      </div>
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-zinc-800/60" />
          <div className="h-3 w-1/2 rounded bg-zinc-800/40" />
        </div>
        <div className="h-7 w-12 rounded bg-zinc-800/50" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800/40" />
        <div className="h-3 w-11/12 rounded bg-zinc-800/40" />
        <div className="h-3 w-9/12 rounded bg-zinc-800/40" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-2/3 rounded bg-zinc-800/60" />
        <div className="h-3 w-1/3 rounded bg-zinc-800/40" />
      </div>
    </div>
  );
}

export function ProfileClient() {
  const { token, isAuthenticated } = useAuth();
  const {
    me,
    stats,
    isLoading,
    error,
    updateBio,
    isUpdatingBio,
    updateBioError,
  } = useProfile(token);
  const {
    data: lists,
    isLoading: isListsLoading,
    error: listsError,
  } = useLists(token);

  const favoritesTopRef = useRef<HTMLDivElement | null>(null);
  const reviewsTopRef = useRef<HTMLDivElement | null>(null);
  const listsTopRef = useRef<HTMLDivElement | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteGames, setFavoriteGames] = useState<GameDetails[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [isFavoritesLoadingMore, setIsFavoritesLoadingMore] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [favoritesCursor, setFavoritesCursor] = useState(0);
  const [isFavoritesCollapsed, setIsFavoritesCollapsed] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewGameTitles, setReviewGameTitles] = useState<
    Record<string, string>
  >({});

  const [isReviewsCollapsed, setIsReviewsCollapsed] = useState(true);

  const [isListsCollapsed, setIsListsCollapsed] = useState(true);

  const displayedLists = useMemo(
    () => (token ? (lists ?? []) : []),
    [token, lists],
  );
  const visibleLists = useMemo(() => {
    if (!token) return [];
    if (!isListsCollapsed) return displayedLists;
    return displayedLists.slice(0, LISTS_COLLAPSED_SIZE);
  }, [token, isListsCollapsed, displayedLists]);
  const displayedListsTotal = useMemo(
    () => (token ? displayedLists.length : 0),
    [token, displayedLists.length],
  );
  const displayedListsLoading = useMemo(
    () => (token ? isListsLoading : false),
    [token, isListsLoading],
  );
  const displayedListsError = useMemo(
    () => (token ? listsError : null),
    [token, listsError],
  );

  const canExpandLists = useMemo(() => {
    if (!token) return false;
    return isListsCollapsed && displayedListsTotal > LISTS_COLLAPSED_SIZE;
  }, [token, isListsCollapsed, displayedListsTotal]);

  const canCollapseLists = useMemo(() => {
    if (!token) return false;
    return !isListsCollapsed && displayedListsTotal > LISTS_COLLAPSED_SIZE;
  }, [token, isListsCollapsed, displayedListsTotal]);

  const handleExpandLists = useCallback(() => {
    setIsListsCollapsed(false);
  }, []);

  const handleCollapseLists = useCallback(() => {
    setIsListsCollapsed(true);
    listsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const rawBio = useMemo(() => me?.bio ?? "", [me?.bio]);
  const trimmedBio = useMemo(() => rawBio.trim(), [rawBio]);
  const headerBio = useMemo(
    () => (trimmedBio.length ? trimmedBio : undefined),
    [trimmedBio],
  );

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(rawBio);

  useEffect(() => {
    if (!isEditingBio) setBioDraft(rawBio);
  }, [rawBio, isEditingBio]);

  const displayedFavoriteGames = useMemo(
    () => (token ? favoriteGames : []),
    [token, favoriteGames],
  );
  const visibleFavoriteGames = useMemo(() => {
    if (!token) return [];
    if (!isFavoritesCollapsed) return displayedFavoriteGames;
    return displayedFavoriteGames.slice(0, FAVORITES_COLLAPSED_SIZE);
  }, [token, isFavoritesCollapsed, displayedFavoriteGames]);
  const displayedFavoriteTotal = useMemo(
    () => (token ? favoriteIds.length : 0),
    [token, favoriteIds.length],
  );
  const displayedFavoritesLoading = useMemo(
    () => (token ? isFavoritesLoading : false),
    [token, isFavoritesLoading],
  );
  const displayedFavoritesLoadingMore = useMemo(
    () => (token ? isFavoritesLoadingMore : false),
    [token, isFavoritesLoadingMore],
  );
  const displayedFavoritesError = useMemo(
    () => (token ? favoritesError : null),
    [token, favoritesError],
  );
  const displayedReviews = useMemo(
    () => (token ? reviews : []),
    [token, reviews],
  );
  const visibleReviews = useMemo(() => {
    if (!token) return [];
    if (!isReviewsCollapsed) return displayedReviews;
    return displayedReviews.slice(0, REVIEWS_COLLAPSED_SIZE);
  }, [token, isReviewsCollapsed, displayedReviews]);
  const displayedReviewsTotal = useMemo(
    () => (token ? displayedReviews.length : 0),
    [token, displayedReviews.length],
  );
  const displayedReviewsError = useMemo(
    () => (token ? reviewsError : null),
    [token, reviewsError],
  );
  const displayedReviewsLoading = useMemo(
    () => (token ? isReviewsLoading : false),
    [token, isReviewsLoading],
  );

  const canExpandReviews = useMemo(() => {
    if (!token) return false;
    return isReviewsCollapsed && displayedReviewsTotal > REVIEWS_COLLAPSED_SIZE;
  }, [token, isReviewsCollapsed, displayedReviewsTotal]);

  const canCollapseReviews = useMemo(() => {
    if (!token) return false;
    return (
      !isReviewsCollapsed && displayedReviewsTotal > REVIEWS_COLLAPSED_SIZE
    );
  }, [token, isReviewsCollapsed, displayedReviewsTotal]);

  const handleExpandReviews = useCallback(() => {
    setIsReviewsCollapsed(false);
  }, []);

  const handleCollapseReviews = useCallback(() => {
    setIsReviewsCollapsed(true);
    reviewsTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    const authToken = token;

    let cancelled = false;

    async function loadNextPage(ids: string[], startIndex: number) {
      const batchIds = ids.slice(startIndex, startIndex + FAVORITES_PAGE_SIZE);
      if (batchIds.length === 0) return startIndex;

      const details: GameDetails[] = [];
      const requestBatchSize = 8;

      for (let i = 0; i < batchIds.length; i += requestBatchSize) {
        const chunk = batchIds.slice(i, i + requestBatchSize);
        const settled = await Promise.allSettled(
          chunk.map((id) => gamesService.getGameDetails(id)),
        );

        for (const result of settled) {
          if (result.status === "fulfilled") details.push(result.value);
        }

        if (cancelled) return startIndex;
      }

      if (cancelled) return startIndex;

      setFavoriteGames((prev) => {
        const seen = new Set(prev.map((g) => String(g.id)));
        const next = [...prev];
        for (const game of details) {
          const id = String(game.id);
          if (!seen.has(id)) {
            seen.add(id);
            next.push(game);
          }
        }
        return next;
      });

      return Math.min(startIndex + FAVORITES_PAGE_SIZE, ids.length);
    }

    async function run() {
      setIsFavoritesLoading(true);
      setIsFavoritesLoadingMore(false);
      setFavoritesError(null);
      setFavoriteGames([]);
      setFavoriteIds([]);
      setFavoritesCursor(0);
      setIsFavoritesCollapsed(true);

      try {
        const likedIdsRaw = await gamesService.getMyLikedGames(authToken);
        const likedIds = Array.isArray(likedIdsRaw) ? likedIdsRaw : [];
        const ids = Array.from(new Set(likedIds));
        if (cancelled) return;

        setFavoriteIds(ids);
        const nextCursor = await loadNextPage(ids, 0);
        if (cancelled) return;
        setFavoritesCursor(nextCursor);
      } catch (e) {
        if (!cancelled) setFavoritesError(getErrorMessage(e));
        if (!cancelled) {
          setFavoriteGames([]);
          setFavoriteIds([]);
          setFavoritesCursor(0);
        }
      } finally {
        if (!cancelled) setIsFavoritesLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canLoadMoreFavorites = useMemo(() => {
    if (!token) return false;
    return favoritesCursor < favoriteIds.length;
  }, [token, favoritesCursor, favoriteIds.length]);

  const hasMoreThanFirstPageFavorites = useMemo(() => {
    if (!token) return false;
    return displayedFavoriteTotal > FAVORITES_PAGE_SIZE;
  }, [token, displayedFavoriteTotal]);

  const hasMoreThanCollapsedFavorites = useMemo(() => {
    if (!token) return false;
    return displayedFavoriteTotal > FAVORITES_COLLAPSED_SIZE;
  }, [token, displayedFavoriteTotal]);

  const isShowingMoreThanFirstPageFavorites = useMemo(() => {
    if (!token) return false;
    return (
      !isFavoritesCollapsed &&
      displayedFavoriteGames.length > FAVORITES_PAGE_SIZE
    );
  }, [token, isFavoritesCollapsed, displayedFavoriteGames.length]);

  const canExpandFavorites = useMemo(() => {
    if (!token) return false;
    return isFavoritesCollapsed && hasMoreThanCollapsedFavorites;
  }, [token, isFavoritesCollapsed, hasMoreThanCollapsedFavorites]);

  const handleCollapseFavorites = useCallback(() => {
    setIsFavoritesCollapsed(true);
    favoritesTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleExpandFavorites = useCallback(() => {
    setIsFavoritesCollapsed(false);
  }, []);

  const fetchFavoriteDetailsBatch = useCallback(async (ids: string[]) => {
    const details: GameDetails[] = [];
    const requestBatchSize = 8;

    for (let i = 0; i < ids.length; i += requestBatchSize) {
      const chunk = ids.slice(i, i + requestBatchSize);
      const settled = await Promise.allSettled(
        chunk.map((id) => gamesService.getGameDetails(id)),
      );

      for (const result of settled) {
        if (result.status === "fulfilled") details.push(result.value);
      }
    }

    return details;
  }, []);

  const appendUniqueFavoriteGames = useCallback((details: GameDetails[]) => {
    setFavoriteGames((prev) => {
      const seen = new Set(prev.map((g) => String(g.id)));
      const next = [...prev];
      for (const game of details) {
        const id = String(game.id);
        if (!seen.has(id)) {
          seen.add(id);
          next.push(game);
        }
      }
      return next;
    });
  }, []);

  const handleLoadMoreFavorites = useCallback(async () => {
    if (!token) return;
    if (isFavoritesLoading || isFavoritesLoadingMore) return;

    // If user collapsed after loading more, first just expand.
    if (isFavoritesCollapsed) {
      setIsFavoritesCollapsed(false);
      return;
    }

    if (favoritesCursor >= favoriteIds.length) return;

    setIsFavoritesLoadingMore(true);
    setFavoritesError(null);

    try {
      const startIndex = favoritesCursor;
      const batchIds = favoriteIds.slice(
        startIndex,
        startIndex + FAVORITES_PAGE_SIZE,
      );
      const details = await fetchFavoriteDetailsBatch(batchIds);
      appendUniqueFavoriteGames(details);
      setFavoritesCursor(startIndex + FAVORITES_PAGE_SIZE);
    } catch (e) {
      setFavoritesError(getErrorMessage(e));
    } finally {
      setIsFavoritesLoadingMore(false);
    }
  }, [
    token,
    isFavoritesLoading,
    isFavoritesLoadingMore,
    isFavoritesCollapsed,
    favoritesCursor,
    favoriteIds,
    fetchFavoriteDetailsBatch,
    appendUniqueFavoriteGames,
  ]);

  useEffect(() => {
    if (!token) return;

    const rawgIds = Array.from(
      new Set(
        (reviews ?? [])
          .map((r) => r.game?.gameId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const missing = rawgIds.filter((id) => !reviewGameTitles[id]);
    if (missing.length === 0) return;

    let cancelled = false;

    async function run() {
      try {
        const pairs = await Promise.all(
          missing.map(async (rawgId) => {
            try {
              const game = await gamesService.getGameDetails(rawgId);
              return [rawgId, game?.name ?? `Jogo #${rawgId}`] as const;
            } catch {
              return [rawgId, `Jogo #${rawgId}`] as const;
            }
          }),
        );

        if (cancelled) return;
        setReviewGameTitles((prev) => {
          const next = { ...prev };
          for (const [id, name] of pairs) next[id] = name;
          return next;
        });
      } catch {
        // ignore
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, reviews, reviewGameTitles]);

  useEffect(() => {
    if (!token) return;

    const authToken = token;

    let cancelled = false;

    async function run() {
      setIsReviewsLoading(true);
      setReviewsError(null);
      try {
        const result = await reviewsService.getMyReviews(authToken);
        if (!cancelled) setReviews(Array.isArray(result) ? result : []);
      } catch (e) {
        if (!cancelled) setReviewsError(getErrorMessage(e));
      } finally {
        if (!cancelled) setIsReviewsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const derivedStats = useMemo(() => {
    const reviewsCount = stats?.reviewsCount ?? 0;
    const listsCount = stats?.listsCount ?? lists?.length ?? 0;
    const likedGamesCount =
      stats?.likedGamesCount ?? displayedFavoriteGames.length;

    return [
      { label: "Reviews", value: String(reviewsCount) },
      { label: "Listas", value: String(listsCount) },
      { label: "Favoritos", value: String(likedGamesCount) },
    ];
  }, [stats, lists, displayedFavoriteGames.length]);

  const reviewCards = useMemo(() => {
    const username = emailToHandle(me?.email);

    return (visibleReviews ?? []).map((review) => {
      const dateLabel = formatDatePtBr(review.createdAt) || "";
      const rating =
        typeof review.rating === "number" && Number.isFinite(review.rating)
          ? Math.min(5, Math.max(0, review.rating / 2))
          : 0;

      const rawgId = review.game?.gameId;

      return {
        id: review.id,
        username,
        dateLabel,
        rating,
        title: rawgId
          ? (reviewGameTitles[rawgId] ?? `Jogo #${rawgId}`)
          : "Review",
        content: review.comment,
        rawgId,
      };
    });
  }, [visibleReviews, me?.email, reviewGameTitles]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Faça login para ver seu perfil"
        description="Seu perfil e suas estatísticas dependem da sua conta."
        actionLabel="Ir para login"
        actionHref="/login"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[168px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[92px] rounded-xl border border-zinc-800 bg-zinc-900/20 animate-pulse"
            />
          ))}
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <div className="h-[260px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
            <div className="h-[420px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
          </div>
          <div className="space-y-10">
            <div className="h-[320px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
            <div className="h-[220px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Não foi possível carregar seu perfil"
        description={error}
        actionLabel="Voltar"
        actionHref="/"
      />
    );
  }

  const name = me?.name ?? "Usuário";
  const handle = emailToHandle(me?.email);

  return (
    <div className="space-y-6">
      <ProfileHeader name={name} handle={handle} bio={headerBio} />
      <ProfileStats stats={derivedStats} />

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <div ref={reviewsTopRef} />

          <ProfileSection
            title="Reviews"
            description="Últimas avaliações publicadas."
            right={
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {displayedReviewsTotal
                    ? `${reviewCards.length}/${displayedReviewsTotal} reviews`
                    : `${reviewCards.length} reviews`}
                </span>
                {canExpandReviews ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandReviews}
                    disabled={displayedReviewsLoading}
                  >
                    Ver mais
                  </Button>
                ) : null}
                {canCollapseReviews ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapseReviews}
                    disabled={displayedReviewsLoading}
                  >
                    Ver menos
                  </Button>
                ) : null}
              </div>
            }
          >
            {displayedReviewsError ? (
              <Card className="border-zinc-800 bg-zinc-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-300">
                    Não foi possível carregar suas reviews.
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {displayedReviewsError}
                  </p>
                </CardContent>
              </Card>
            ) : displayedReviewsLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: REVIEWS_COLLAPSED_SIZE }).map(
                  (_, index) => (
                    <ReviewCardSkeleton key={index} />
                  ),
                )}
              </div>
            ) : reviewCards.length === 0 ? (
              <Card className="border-zinc-800 bg-zinc-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-300">Nenhuma review ainda.</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Assim que você avaliar jogos, elas aparecem aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reviewCards.map((review) => (
                  <ReviewCard
                    key={review.id}
                    username={review.username}
                    dateLabel={review.dateLabel}
                    rating={review.rating}
                    title={review.title}
                    content={review.content}
                  />
                ))}
              </div>
            )}
          </ProfileSection>

          <div ref={favoritesTopRef} />

          <ProfileSection
            title="Favoritos"
            description="Jogos marcados para acesso rápido."
            right={
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {displayedFavoriteTotal
                    ? `${visibleFavoriteGames.length}/${displayedFavoriteTotal} jogos`
                    : `${visibleFavoriteGames.length} jogos`}
                </span>
                {canExpandFavorites ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandFavorites}
                    disabled={
                      displayedFavoritesLoading || displayedFavoritesLoadingMore
                    }
                  >
                    Ver mais
                  </Button>
                ) : null}
                {!isFavoritesCollapsed && hasMoreThanCollapsedFavorites ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapseFavorites}
                    disabled={
                      displayedFavoritesLoading || displayedFavoritesLoadingMore
                    }
                  >
                    Ver menos
                  </Button>
                ) : null}
                {!isFavoritesCollapsed && canLoadMoreFavorites ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMoreFavorites}
                      disabled={
                        displayedFavoritesLoading ||
                        displayedFavoritesLoadingMore
                      }
                    >
                      {displayedFavoritesLoadingMore
                        ? "Carregando..."
                        : "Ver mais"}
                    </Button>
                  </>
                ) : null}
              </div>
            }
          >
            {displayedFavoritesError ? (
              <Card className="border-zinc-800 bg-zinc-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-300">
                    Não foi possível carregar favoritos.
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {displayedFavoritesError}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedFavoritesLoading ? (
                  Array.from({ length: FAVORITES_COLLAPSED_SIZE }).map(
                    (_, index) => <FavoriteCardSkeleton key={index} />,
                  )
                ) : visibleFavoriteGames.length === 0 ? (
                  <Card className="border-zinc-800 bg-zinc-900/20 sm:col-span-2">
                    <CardContent className="p-4">
                      <p className="text-sm text-zinc-300">
                        Nenhum jogo favoritado ainda.
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Favorite jogos na página de detalhes.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {visibleFavoriteGames.map((game) => {
                      const releasedLabel = formatReleaseDatePtBr(
                        game.released,
                      );
                      return (
                        <GameCard
                          key={game.id}
                          title={game.name}
                          description={releasedLabel || undefined}
                          siteRating={game.gameboxdRating}
                          metacritic={game.metacritic}
                          genre={game.genres?.[0] ?? "—"}
                          genres={game.genres}
                          showHeaderRatings={false}
                          showReviewButton={false}
                          imageUrl={game.background_image}
                          detailsHref={`/games/${game.id}`}
                        />
                      );
                    })}
                    {displayedFavoritesLoadingMore
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <FavoriteCardSkeleton key={`more-${index}`} />
                        ))
                      : null}
                  </>
                )}
              </div>
            )}
          </ProfileSection>
        </div>

        <aside className="space-y-10">
          <div ref={listsTopRef} />

          <ProfileSection
            title="Listas"
            description="Coleções organizadas visualmente."
            right={
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {displayedListsTotal
                    ? `${visibleLists.length}/${displayedListsTotal} listas`
                    : `${visibleLists.length} listas`}
                </span>
                {canExpandLists ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandLists}
                    disabled={displayedListsLoading}
                  >
                    Ver mais
                  </Button>
                ) : null}
                {canCollapseLists ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapseLists}
                    disabled={displayedListsLoading}
                  >
                    Ver menos
                  </Button>
                ) : null}
                <Button asChild variant="outline" size="sm">
                  <Link href="/lists?create=1">Criar</Link>
                </Button>
              </div>
            }
          >
            <div className="grid gap-3">
              {displayedListsError ? (
                <Card className="border-zinc-800 bg-zinc-900/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-zinc-300">
                      Não foi possível carregar listas.
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {displayedListsError}
                    </p>
                  </CardContent>
                </Card>
              ) : displayedListsLoading ? (
                Array.from({ length: LISTS_COLLAPSED_SIZE }).map((_, index) => (
                  <ListItemSkeleton key={index} />
                ))
              ) : visibleLists.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-zinc-300">
                      Nenhuma lista ainda.
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Crie listas para organizar seu backlog.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                visibleLists.map((list) => (
                  <Link key={list.id} href={`/lists/${list.id}`}>
                    <Card className="cursor-pointer border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-100">
                              {list.name}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {list.listGames?.length ?? 0} jogos
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </ProfileSection>

          <ProfileSection
            title="Bio"
            description={`Texto curto e objetivo (até ${BIO_MAX_LENGTH} caracteres).`}
            right={
              token && isAuthenticated ? (
                isEditingBio ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!token) return;

                        const normalized = bioDraft.trim();
                        const nextBio = normalized.length ? normalized : null;
                        const currentNormalized = rawBio.trim();

                        if (normalized.length > BIO_MAX_LENGTH) return;
                        if (normalized === currentNormalized) {
                          setIsEditingBio(false);
                          return;
                        }

                        try {
                          await updateBio(nextBio);
                          setIsEditingBio(false);
                        } catch {
                          // Surface the error via updateBioError.
                        }
                      }}
                      disabled={
                        isUpdatingBio ||
                        bioDraft.trim().length > BIO_MAX_LENGTH ||
                        bioDraft.trim() === rawBio.trim()
                      }
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBioDraft(rawBio);
                        setIsEditingBio(false);
                      }}
                      disabled={isUpdatingBio}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                    disabled={isUpdatingBio}
                  >
                    Editar
                  </Button>
                )
              ) : null
            }
          >
            <Card className="border-zinc-800 bg-zinc-900/20">
              <CardContent className="p-4">
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      className="min-h-[96px] w-full resize-none rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-sm leading-7 text-zinc-100 outline-none focus:border-zinc-700"
                      value={bioDraft}
                      maxLength={BIO_MAX_LENGTH}
                      onChange={(e) => setBioDraft(e.target.value)}
                      placeholder="Escreva algo sobre você…"
                      disabled={isUpdatingBio}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">
                        {bioDraft.length}/{BIO_MAX_LENGTH}
                      </p>
                      {isUpdatingBio ? (
                        <p className="text-xs text-zinc-400">Salvando…</p>
                      ) : null}
                    </div>
                    {updateBioError ? (
                      <p className="text-xs text-red-400">{updateBioError}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-zinc-200">
                    {trimmedBio.length
                      ? trimmedBio
                      : "Você ainda não adicionou uma bio."}
                  </p>
                )}
              </CardContent>
            </Card>
          </ProfileSection>
        </aside>
      </div>
    </div>
  );
}
