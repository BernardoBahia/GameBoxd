"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { gamesService } from "@/services/games.service";
import { listsService } from "@/services/lists.service";
import { reviewsService } from "@/services/reviews.service";
import type { List } from "@/types/lists";
import { getErrorMessage } from "@/utils/errors";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface ActionButtonsProps {
  gameId: string;
  onAfterAction?: () => void | Promise<void>;
  className?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function ActionButtons({
  gameId,
  onAfterAction,
  className,
}: ActionButtonsProps) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string>(
    "Botões conectados ao backend."
  );

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating5, setRating5] = useState<string>("4");
  const [comment, setComment] = useState<string>("");

  const [isAddToListOpen, setIsAddToListOpen] = useState(false);
  const [lists, setLists] = useState<List[] | null>(null);
  const [selectedListId, setSelectedListId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!isAuthenticated || !token) return;
      try {
        const liked = await gamesService.getMyLikedGames(token ?? undefined);
        if (!cancelled) setIsLiked(liked.includes(String(gameId)));
      } catch {
        // Silencioso: não bloqueia o restante da página
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, gameId]);

  const requireAuth = useCallback(() => {
    if (isAuthenticated && token) return true;
    setMessage("Faça login para usar essas ações.");
    router.push("/login");
    return false;
  }, [isAuthenticated, token, router]);

  const handleLike = useCallback(async () => {
    if (!requireAuth()) return;
    setIsBusy(true);
    setMessage("Salvando...");
    try {
      const result = await gamesService.likeGame(
        String(gameId),
        token ?? undefined
      );
      setIsLiked(result.liked);
      setMessage(result.liked ? "Jogo favoritado." : "Favorito removido.");
      onAfterAction?.();
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setIsBusy(false);
    }
  }, [requireAuth, gameId, token, onAfterAction]);

  const openAddToList = useCallback(async () => {
    if (!requireAuth()) return;

    // Close rating form to keep the panel clean.
    setIsRatingOpen(false);

    // Toggle close
    if (isAddToListOpen) {
      setIsAddToListOpen(false);
      return;
    }

    setIsAddToListOpen(true);

    // Load lists once (or refresh if none cached)
    if (lists) return;

    setIsBusy(true);
    setMessage("Carregando suas listas...");
    try {
      const fetched = await listsService.getLists(token ?? undefined);
      setLists(fetched);
      if (fetched.length > 0) {
        setSelectedListId(fetched[0].id);
        setMessage("Selecione uma lista para adicionar.");
      } else {
        setMessage("Você ainda não tem listas. Crie uma para adicionar jogos.");
      }
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setIsBusy(false);
    }
  }, [requireAuth, isAddToListOpen, lists, token]);

  const submitAddToList = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!requireAuth()) return;

      if (!selectedListId) {
        setMessage("Selecione uma lista.");
        return;
      }

      setIsBusy(true);
      setMessage("Adicionando à lista...");
      try {
        await listsService.addGameToList(
          selectedListId,
          String(gameId),
          token ?? undefined
        );
        setMessage("Jogo adicionado à lista.");
        setIsAddToListOpen(false);
        onAfterAction?.();
      } catch (err) {
        setMessage(getErrorMessage(err));
      } finally {
        setIsBusy(false);
      }
    },
    [requireAuth, selectedListId, gameId, token, onAfterAction]
  );

  const handleRate = useCallback(async () => {
    if (!requireAuth()) return;
    setIsAddToListOpen(false);
    setIsRatingOpen((v) => !v);
    setMessage("Preencha sua avaliação abaixo.");
  }, [requireAuth]);

  const submitRating = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!requireAuth()) return;

      const ratingValue = Number(rating5);
      if (!Number.isFinite(ratingValue)) {
        setMessage("Nota inválida.");
        return;
      }

      const rating10 = clamp(ratingValue, 0, 5) * 2;
      if (!comment.trim()) {
        setMessage("Comentário é obrigatório.");
        return;
      }

      setIsBusy(true);
      setMessage("Enviando review...");
      try {
        await reviewsService.createReview(
          {
            gameId: String(gameId),
            rating: rating10,
            comment: comment.trim(),
          },
          token ?? undefined
        );
        setMessage("Review enviada.");
        setIsRatingOpen(false);
        setComment("");
        onAfterAction?.();
      } catch (err) {
        setMessage(getErrorMessage(err));
      } finally {
        setIsBusy(false);
      }
    },
    [requireAuth, rating5, comment, gameId, token, onAfterAction]
  );

  const favoriteLabel = useMemo(
    () => (isLiked ? "Desfavoritar" : "Favoritar"),
    [isLiked]
  );

  return (
    <Card className={cn("border-zinc-800", className)}>
      <CardContent className="p-6">
        <div className="grid gap-2">
          <Button onClick={handleLike} disabled={isBusy}>
            {favoriteLabel}
          </Button>
          <Button variant="outline" onClick={openAddToList} disabled={isBusy}>
            {isAddToListOpen ? "Fechar listas" : "Adicionar à lista"}
          </Button>
          <Button variant="secondary" onClick={handleRate} disabled={isBusy}>
            {isRatingOpen ? "Cancelar avaliação" : "Avaliar"}
          </Button>
        </div>

        {isAddToListOpen ? (
          <form onSubmit={submitAddToList} className="mt-4 space-y-3">
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-200"
                htmlFor="list"
              >
                Lista
              </label>
              <select
                id="list"
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                disabled={isBusy || (lists?.length ?? 0) === 0}
                className={cn(
                  "h-11 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
                )}
              >
                {(lists ?? []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {(lists?.length ?? 0) === 0 ? (
                <p className="text-xs text-zinc-500">
                  Você não tem listas.{" "}
                  <Link href="/lists?create=1" className="underline">
                    Criar lista
                  </Link>
                </p>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="submit"
                disabled={isBusy || (lists?.length ?? 0) === 0}
              >
                {isBusy ? "Adicionando..." : "Adicionar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => setIsAddToListOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </form>
        ) : null}

        {isRatingOpen ? (
          <form onSubmit={submitRating} className="mt-4 space-y-3">
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-200"
                htmlFor="rating"
              >
                Nota (0 a 5)
              </label>
              <select
                id="rating"
                value={rating5}
                onChange={(e) => setRating5(e.target.value)}
                disabled={isBusy}
                className={cn(
                  "h-11 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
                )}
              >
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={String(v)}>
                    {v}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                Você envia em escala 0..10 para o backend.
              </p>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-200"
                htmlFor="comment"
              >
                Comentário
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isBusy}
                rows={4}
                placeholder="Escreva o que achou do jogo..."
                className={cn(
                  "w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
                )}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="submit" disabled={isBusy}>
                {isBusy ? "Enviando..." : "Enviar review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => setIsRatingOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </form>
        ) : null}

        <p className="mt-3 text-xs leading-5 text-zinc-500">{message}</p>
      </CardContent>
    </Card>
  );
}
