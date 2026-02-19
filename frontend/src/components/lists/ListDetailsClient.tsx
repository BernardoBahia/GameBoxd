"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GameCard } from "@/components/GameCard";
import { EmptyState } from "@/components/lists/EmptyState";
import { ListHeader } from "@/components/lists/ListHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useListDetails } from "@/hooks/useLists";
import { listsService } from "@/services/lists.service";
import { formatDatePtBr } from "@/utils/date";
import { getErrorMessage } from "@/utils/errors";

export interface ListDetailsClientProps {
  listId: string;
}

export function ListDetailsClient({ listId }: ListDetailsClientProps) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useListDetails(listId, token);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftIsPublic, setDraftIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setDraftName(data.name ?? "");
    setDraftIsPublic(Boolean(data.isPublic));
  }, [data]);

  const games = useMemo(() => {
    const items = data?.listGames ?? [];

    return items
      .map((item) => {
        const title = item.game?.name ?? "Jogo";
        const description = item.game?.released
          ? `Lançamento: ${
              formatDatePtBr(item.game.released) || item.game.released
            }`
          : "";
        const genre = item.game?.genres?.[0] ?? "—";
        const genres = item.game?.genres ?? [];
        const imageUrl = item.game?.background_image;

        const siteRating = item.game?.gameboxdRating;
        const metacritic = item.game?.metacritic;

        return {
          listGameId: item.id,
          title,
          description,
          siteRating,
          metacritic,
          genre,
          genres,
          imageUrl,
          detailsHref: item.game?.gameId
            ? `/games/${item.game.gameId}`
            : "/games",
        };
      })
      .filter((g) => Boolean(g.title));
  }, [data]);

  async function handleSave() {
    if (!token) return;

    const name = draftName.trim();
    if (!name) {
      setEditError("Digite um nome para a lista.");
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      await listsService.updateList(
        listId,
        { name, isPublic: draftIsPublic },
        token,
      );
      await refetch();
      setIsEditing(false);
    } catch (e) {
      setEditError(getErrorMessage(e));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(listGameId: string) {
    if (!token) return;
    const ok = window.confirm("Remover este jogo da lista?");
    if (!ok) return;

    setRemovingId(listGameId);
    try {
      await listsService.removeListGameItem(listId, listGameId, token);
      await refetch();
    } catch (e) {
      setEditError(getErrorMessage(e));
    } finally {
      setRemovingId(null);
    }
  }

  async function handleDeleteList() {
    if (!token) return;
    const ok = window.confirm(
      "Tem certeza que deseja excluir esta lista? Isso não pode ser desfeito.",
    );
    if (!ok) return;

    setIsDeleting(true);
    setEditError(null);
    try {
      await listsService.deleteList(listId, token);
      router.push("/lists");
    } catch (e) {
      setEditError(getErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Faça login para ver esta lista"
        description="Suas listas são vinculadas à sua conta."
        actionLabel="Ir para login"
        actionHref="/login"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-[168px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[328px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Não foi possível carregar a lista"
        description={error}
        actionLabel="Voltar para listas"
        actionHref="/lists"
      />
    );
  }

  const listName = data?.name ?? "Lista";
  const listDescription = data
    ? data.isPublic
      ? "Lista pública"
      : "Lista privada"
    : undefined;

  return (
    <>
      <ListHeader
        name={listName}
        description={listDescription}
        gamesCount={games.length}
        right={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditError(null);
              setIsEditing((v) => !v);
            }}
          >
            {isEditing ? "Fechar" : "Editar"}
          </Button>
        }
      />

      {isEditing ? (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-zinc-200">
                Nome da lista
              </label>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Ex: Backlog 2026"
                className="mt-2 h-11 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-200">
                Privacidade
              </label>
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={draftIsPublic}
                  onChange={(e) => setDraftIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border border-zinc-700 bg-zinc-900"
                  disabled={isSaving}
                />
                <label htmlFor="isPublic" className="text-sm text-zinc-300">
                  Lista pública
                </label>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Desmarque para deixar privada.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditError(null);
                setIsEditing(false);
                setDraftName(data?.name ?? "");
                setDraftIsPublic(Boolean(data?.isPublic));
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <Button
              variant="outline"
              onClick={handleDeleteList}
              disabled={isSaving || isDeleting}
              className="border-red-400/40 text-red-200 hover:bg-red-500/10"
            >
              {isDeleting ? "Excluindo..." : "Excluir lista"}
            </Button>
          </div>

          {editError ? (
            <p className="mt-3 text-sm text-red-300">{editError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8">
        {games.length === 0 ? (
          <EmptyState
            title="Nenhum jogo na lista"
            description="Quando você adicionar jogos, eles vão aparecer aqui."
            actionLabel="Explorar jogos"
            actionHref="/games"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <div key={game.listGameId} className="relative">
                <GameCard
                  title={game.title}
                  description={game.description}
                  siteRating={game.siteRating}
                  metacritic={game.metacritic}
                  genre={game.genre}
                  genres={game.genres}
                  showHeaderRatings={false}
                  showReviewButton={false}
                  imageUrl={game.imageUrl}
                  detailsHref={game.detailsHref}
                />

                {isEditing ? (
                  <div className="absolute right-3 top-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(game.listGameId)}
                      disabled={removingId === game.listGameId}
                    >
                      {removingId === game.listGameId
                        ? "Removendo..."
                        : "Remover"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
