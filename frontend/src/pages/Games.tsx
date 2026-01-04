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
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedOrdering, setSelectedOrdering] = useState("-rating");

  const gamesPerPage = 20;
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGames();
  }, [selectedPlatform, selectedGenre, selectedYear, selectedOrdering]);

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

      const filters: any = {};
      if (selectedPlatform) filters.platforms = selectedPlatform;
      if (selectedGenre) filters.genres = selectedGenre;
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        filters.dates = `${startDate},${endDate}`;
      }
      if (selectedOrdering) filters.ordering = selectedOrdering;

      const data = await gameService.getGames(
        page,
        gamesPerPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );

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

      const filters: any = {};
      if (selectedPlatform) filters.platforms = selectedPlatform;
      if (selectedGenre) filters.genres = selectedGenre;
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        filters.dates = `${startDate},${endDate}`;
      }
      if (selectedOrdering) filters.ordering = selectedOrdering;

      const data = await gameService.getGames(
        nextPage,
        gamesPerPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );

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

  const handleClearFilters = () => {
    setSelectedPlatform("");
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedOrdering("-rating");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedPlatform ||
    selectedGenre ||
    selectedYear ||
    selectedOrdering !== "-rating";

  // Platform options (RAWG platform IDs)
  const platforms = [
    { id: "4", name: "PC" },
    { id: "187", name: "PlayStation 5" },
    { id: "18", name: "PlayStation 4" },
    { id: "1", name: "Xbox One" },
    { id: "186", name: "Xbox Series X/S" },
    { id: "7", name: "Nintendo Switch" },
    { id: "3", name: "iOS" },
    { id: "21", name: "Android" },
  ];

  // Genre options (RAWG genre IDs)
  const genres = [
    { id: "4", name: "Action" },
    { id: "51", name: "Indie" },
    { id: "3", name: "Adventure" },
    { id: "5", name: "RPG" },
    { id: "10", name: "Strategy" },
    { id: "2", name: "Shooter" },
    { id: "40", name: "Casual" },
    { id: "14", name: "Simulation" },
    { id: "7", name: "Puzzle" },
    { id: "11", name: "Arcade" },
    { id: "83", name: "Platformer" },
    { id: "1", name: "Racing" },
    { id: "59", name: "Massively Multiplayer" },
    { id: "15", name: "Sports" },
    { id: "6", name: "Fighting" },
  ];

  // Year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  // Ordering options
  const orderingOptions = [
    { value: "-rating", label: "Melhor Avaliados" },
    { value: "-released", label: "Mais Recentes" },
    { value: "released", label: "Mais Antigos" },
    { value: "-added", label: "Mais Populares" },
    { value: "name", label: "Nome (A-Z)" },
    { value: "-name", label: "Nome (Z-A)" },
    { value: "-metacritic", label: "Metacritic" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jogos..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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

        {/* Filters Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <span>🔍</span>
            <span>{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                Ativos
              </span>
            )}
          </button>

          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700 p-6 transition-colors">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Platform Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plataforma
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="">Todas as plataformas</option>
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gênero
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="">Todos os gêneros</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ano de Lançamento
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="">Todos os anos</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ordering Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={selectedOrdering}
                    onChange={(e) => setSelectedOrdering(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    {orderingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          )}
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
