import { useState, useEffect } from "react";
import { gameService } from "../services";
import type { GameSummary } from "../types";
import { Navbar, GameCard, SkeletonGameCard, EmptyState } from "../components";

export default function Games() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const gamesPerPage = 20;

  useEffect(() => {
    fetchGames();
  }, [currentPage]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await gameService.getGames(currentPage, gamesPerPage);
      setGames(data);
      // Por enquanto sem paginação total
      setTotalPages(1);
    } catch (err) {
      setError("Erro ao carregar jogos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchGames();
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await gameService.searchGames(searchQuery, 1, gamesPerPage);
      setGames(data);
      setTotalPages(1);
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
      // Note: gameService.likeGame precisa de userId e gameId
      // Por ora vamos apenas fazer console.log
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onLike={handleLike} />
            ))}
          </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
