"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { SectionTitle } from "@/components/SectionTitle";
import { EmptyState } from "@/components/lists/EmptyState";
import { ListCard } from "@/components/lists/ListCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLists } from "@/hooks/useLists";
import { listsService } from "@/services/lists.service";
import { getErrorMessage } from "@/utils/errors";

export default function ListsPage() {
  const router = useRouter();

  const { token, isAuthenticated, user } = useAuth();
  const { data, isLoading, error, refetch } = useLists(token);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("create") === "1") setIsCreateOpen(true);
  }, []);

  const lists = data ?? [];
  const showEmptyState = !isLoading && !error && lists.length === 0;

  async function handleCreateList() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const userId = user?.id;
    if (!userId) {
      setCreateError("Não foi possível identificar o usuário.");
      return;
    }

    const name = newListName.trim();
    if (!name) {
      setCreateError("Digite um nome para a lista.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await listsService.createList(
        { name, userId },
        token ?? undefined
      );
      setNewListName("");
      setIsCreateOpen(false);
      await refetch();
      router.push(`/lists/${created.id}`);
    } catch (e) {
      setCreateError(getErrorMessage(e));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle
          as="h1"
          title="Minhas listas"
          description="Cards com nome, descrição e quantidade de jogos."
          right={
            isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen((v) => !v)}
              >
                {isCreateOpen ? "Fechar" : "Criar lista"}
              </Button>
            ) : (
              <Button asChild variant="outline">
                <a href="/login">Entrar</a>
              </Button>
            )
          }
        />

        {isCreateOpen && isAuthenticated ? (
          <Card className="mt-6 border-zinc-800 bg-zinc-900/20">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-zinc-200">
                    Nome da lista
                  </label>
                  <input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateList();
                    }}
                    placeholder="Ex: Backlog 2026"
                    className="mt-2 h-11 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20 focus-visible:border-zinc-700"
                    disabled={isCreating}
                  />
                </div>

                <Button onClick={handleCreateList} disabled={isCreating}>
                  {isCreating ? "Criando..." : "Criar"}
                </Button>
              </div>
              {createError ? (
                <p className="mt-3 text-sm text-red-300">{createError}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[188px] rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse"
                />
              ))}
            </div>
          ) : null}

          {!isLoading && error ? (
            <EmptyState
              title="Não foi possível carregar suas listas"
              description={error}
              actionLabel="Tentar novamente"
            />
          ) : null}

          {showEmptyState ? (
            <EmptyState
              title="Nenhuma lista ainda"
              description="Crie sua primeira lista para organizar jogos por tema, ano ou humor."
              actionLabel={
                isAuthenticated ? "Criar primeira lista" : "Fazer login"
              }
              actionHref={isAuthenticated ? undefined : "/login"}
              onAction={() => setIsCreateOpen(true)}
              actionDisabled={isCreating}
            />
          ) : !isLoading && !error ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  name={list.name}
                  description={
                    list.isPublic ? "Lista pública" : "Lista privada"
                  }
                  gamesCount={list.listGames?.length ?? 0}
                  imageUrls={(list.listGames ?? [])
                    .map((item) => item.game?.background_image)
                    .filter((url): url is string => Boolean(url))
                    .slice(0, 3)}
                  href={`/lists/${list.id}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
