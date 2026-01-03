import { useState, useEffect, useRef, useCallback } from "react";
import { gameService } from "../services";
import type { GameSummary } from "../types";
import { Navbar, GameCard, SkeletonGameCard, EmptyState } from "../components";

export default function Games() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const gamesPerPage = 20;
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreGames();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, currentPage]);

  const fetchGames = async (reset = false) => {
    try {
      setLoading(true);
      setError("");
      const page = reset ? 1 : currentPage;
      const data = await gameService.getGames(page, gamesPerPage);

      if (reset) {
        setGames(data.results);
        setCurrentPage(1);
      } else {
        setGames(data.results);
      }

      setTotalCount(data.count);
      setHasMore(!!data.next);
    } catch (err) {
      setError("Erro ao carregar jogos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGames = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const data = await gameService.getGames(nextPage, gamesPerPage);

      setGames((prev) => [...prev, ...data.results]);
      setCurrentPage(nextPage);
      setHasMore(!!data.next);
    } catch (err) {
      console.error("Erro ao carregar mais jogos:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchQuery("");
      setCurrentPage(1);
      fetchGames(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await gameService.searchGames(searchQuery, 1, gamesPerPage);
      setGames(data.results);
      setTotalCount(data.count);
      setHasMore(!!data.next);
      setCurrentPage(1);
    } catch (err) {
      setError("Erro ao buscar jogos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (gameId: number) => {
    try {
      console.log("Like game:", gameId);
      alert("Funcionalidade de curtir em desenvolvimento");
    } catch (err) {
      console.error("Erro ao curtir jogo:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jogos..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonGameCard key={i} />
            ))}
          </div>
        ) : games.length > 0 ? (
          <>
            <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
              Mostrando {games.length} de {totalCount} jogos
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} onLike={handleLike} />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonGameCard key={`loading-${i}`} />
                ))}
              </div>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="h-10" />

            {/* Load More Button (fallback) */}
            {hasMore && !loadingMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreGames}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Carregar Mais Jogos
                </button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && games.length > 0 && (
              <div className="mt-8 text-center text-gray-600 dark:text-gray-400 py-4">
                Você chegou ao fim da lista! 🎮
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="🎮"
            title="Nenhum jogo encontrado"
            message={
              searchQuery
                ? `Não encontramos jogos com "${searchQuery}". Tente buscar por outro termo!`
                : "Ainda não há jogos cadastrados."
            }
          />
        )}
      </main>
    </div>
  );
}
