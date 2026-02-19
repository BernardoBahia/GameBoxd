"use client";

import { useMemo } from "react";

import { SectionTitle } from "@/components/SectionTitle";
import { ActionButtons } from "@/components/game-details/ActionButtons";
import { DLCSection } from "@/components/game-details/DLCSection";
import { GameBanner } from "@/components/game-details/GameBanner";
import { GameInfo } from "@/components/game-details/GameInfo";
import { ReviewCard } from "@/components/game-details/ReviewCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGameDetails } from "@/hooks/useGameDetails";
import type { Review } from "@/types/reviews";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getSiteRating(gameboxdRating?: number) {
  if (typeof gameboxdRating !== "number") return undefined;
  return clamp(gameboxdRating, 0, 5);
}

function getYear(released?: string) {
  if (!released) return new Date().getFullYear();
  const year = Number(String(released).slice(0, 4));
  return Number.isFinite(year) && year > 1970 ? year : new Date().getFullYear();
}

function formatFullDatePtBr(dateIso?: string) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatMonthYear(dateIso?: string) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(d);
}

function getUsername(review: Review) {
  const raw = review.user?.name || review.userId;
  if (!raw) return "@user";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

export function GameDetailsClient({ gameId }: { gameId: string }) {
  const { game, reviews, dlcs, isLoading, error, refetch } =
    useGameDetails(gameId);

  const hasDlcs = (dlcs?.length ?? 0) > 0;

  const siteRating = useMemo(
    () => getSiteRating(game?.gameboxdRating),
    [game?.gameboxdRating],
  );
  const releaseDateLabel = useMemo(() => {
    const formatted = formatFullDatePtBr(game?.released);
    if (formatted) return formatted;
    return String(getYear(game?.released));
  }, [game?.released]);

  const genres = useMemo(() => {
    const items = Array.isArray(game?.genres) ? game?.genres : [];
    return Array.from(new Set(items)).filter(Boolean);
  }, [game?.genres]);

  const developers = useMemo(() => {
    const items = Array.isArray(game?.developers) ? game?.developers : [];
    return Array.from(new Set(items)).filter(Boolean);
  }, [game?.developers]);

  const publishers = useMemo(() => {
    const items = Array.isArray(game?.publishers) ? game?.publishers : [];
    return Array.from(new Set(items)).filter(Boolean);
  }, [game?.publishers]);

  if (isLoading) {
    return (
      <>
        <GameBanner title="Carregando..." subtitle="" />

        <main className="mx-auto max-w-6xl px-4 pb-12 pt-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-sm">
                <SectionTitle as="h2" title="Descrição" description="" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full rounded bg-zinc-800/50" />
                  <div className="h-4 w-5/6 rounded bg-zinc-800/40" />
                  <div className="h-4 w-4/6 rounded bg-zinc-800/30" />
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle
                  as="h2"
                  title="Reviews"
                  description="Cards com hover e boa legibilidade."
                />
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={index}
                      className="border-zinc-800 bg-zinc-900/30"
                    >
                      <CardHeader>
                        <div className="h-5 w-3/4 rounded bg-zinc-800/60" />
                        <div className="mt-3 h-4 w-1/2 rounded bg-zinc-800/40" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 w-full rounded bg-zinc-800/30" />
                        <div className="mt-2 h-4 w-5/6 rounded bg-zinc-800/20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <Card className="border-zinc-800">
                <CardHeader>
                  <div className="h-6 w-3/4 rounded bg-zinc-800/60" />
                  <div className="mt-3 h-4 w-16 rounded bg-zinc-800/40" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full rounded bg-zinc-800/30" />
                </CardContent>
              </Card>
              <ActionButtons gameId={gameId} onAfterAction={refetch} />
            </aside>
          </div>
        </main>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <GameBanner title="Jogo" subtitle="" />
        <main className="mx-auto max-w-6xl px-4 pb-12 pt-8">
          <div className="text-sm text-zinc-400">
            Não foi possível carregar os detalhes do jogo.
          </div>
        </main>
      </>
    );
  }

  const subtitle = game.platforms?.length
    ? `Disponível em ${game.platforms.join(" • ")}`
    : "";

  return (
    <>
      <GameBanner
        title={game.name}
        subtitle={subtitle}
        imageUrl={game.background_image}
      />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-sm">
              <SectionTitle as="h2" title="Descrição" description="" />
              <p className="mt-4 text-sm leading-7 text-zinc-200">
                {game.description || "Descrição indisponível."}
              </p>
            </section>

            <section className="space-y-4">
              <SectionTitle
                as="h2"
                title="Reviews"
                description="Cards com hover e boa legibilidade."
              />
              <div className="grid gap-4">
                {(reviews ?? []).map((review) => (
                  <ReviewCard
                    key={review.id}
                    username={getUsername(review)}
                    dateLabel={formatMonthYear(review.createdAt) || ""}
                    rating={clamp(
                      typeof review.rating === "number" ? review.rating / 2 : 0,
                      0,
                      5,
                    )}
                    title="Review"
                    content={review.comment}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <GameInfo
              title={game.name}
              releaseDateLabel={releaseDateLabel}
              siteRating={siteRating}
              metacritic={game.metacritic}
              genres={genres}
              developers={developers}
              publishers={publishers}
            />
            <ActionButtons gameId={gameId} onAfterAction={refetch} />
            <DLCSection dlcs={dlcs} showEmptyState={!hasDlcs} />
          </aside>
        </div>
      </main>
    </>
  );
}
