import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { gameService } from "../services";
import type { GameStatusType } from "../types";
import { Navbar, Skeleton, EmptyState } from "../components";

export default function MyGames() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<GameStatusType | "ALL">("ALL");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGames();
    }
  }, [user, activeTab]);

  const fetchGames = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const status = activeTab === "ALL" ? undefined : activeTab;
      const gamesData = await gameService.getUserGamesByStatus(user.id, status);
      setGames(gamesData);
    } catch (err) {
      showToast("Erro ao carregar jogos", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusEmoji = (status: GameStatusType) => {
    switch (status) {
      case "PLAYING":
        return "🎮";
      case "COMPLETED":
        return "✅";
      case "WANT_TO_PLAY":
        return "📌";
    }
  };

  const getStatusColor = (status: GameStatusType) => {
    switch (status) {
      case "PLAYING":
        return "bg-blue-600 hover:bg-blue-700";
      case "COMPLETED":
        return "bg-green-600 hover:bg-green-700";
      case "WANT_TO_PLAY":
        return "bg-purple-600 hover:bg-purple-700";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Você precisa estar logado para ver seus jogos
          </h1>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Meus Jogos
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "ALL"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            📚 Todos ({games.length})
          </button>
          <button
            onClick={() => setActiveTab("PLAYING")}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "PLAYING"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>🎮</span>
            Jogando
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "COMPLETED"
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>✅</span>
            Completados
          </button>
          <button
            onClick={() => setActiveTab("WANT_TO_PLAY")}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "WANT_TO_PLAY"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>📌</span>
            Quero Jogar
          </button>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <EmptyState
            icon="🎮"
            title="Nenhum jogo encontrado"
            message={
              activeTab === "ALL"
                ? "Você ainda não marcou nenhum jogo. Explore o catálogo e comece a marcar seus jogos!"
                : `Você não tem jogos marcados como "${
                    activeTab === "PLAYING"
                      ? "Jogando"
                      : activeTab === "COMPLETED"
                      ? "Completados"
                      : "Quero Jogar"
                  }".`
            }
            actionLabel="Explorar Jogos"
            onAction={() => (window.location.href = "/games")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {games.map((gameStatus) => (
              <Link
                key={gameStatus.id}
                to={`/games/${gameStatus.game.gameId}`}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition">
                  <img
                    src={
                      gameStatus.game.background_image ||
                      "/placeholder-game.jpg"
                    }
                    alt={gameStatus.game.name || "Game"}
                    className="w-full h-48 object-cover group-hover:scale-110 transition"
                  />
                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 ${getStatusColor(
                      gameStatus.status
                    )} text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1`}
                  >
                    <span>{getStatusEmoji(gameStatus.status)}</span>
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <div className="p-3 w-full">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {gameStatus.game.name ||
                          `Game #${gameStatus.game.gameId}`}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
