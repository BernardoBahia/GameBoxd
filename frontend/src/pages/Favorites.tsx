import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { gameService } from "../services";
import { Navbar, Skeleton, EmptyState } from "../components";

export default function Favorites() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const likedGames = await gameService.getUserLikedGames(user.id);
      setGames(likedGames);
    } catch (err) {
      showToast("Erro ao carregar jogos favoritos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (gameId: string) => {
    if (!user) return;
    if (!confirm("Deseja remover este jogo dos favoritos?")) return;

    try {
      await gameService.likeGame(user.id, gameId);
      setGames(games.filter((g) => g.game.gameId !== gameId));
      showToast("Jogo removido dos favoritos", "success");
    } catch (err) {
      showToast("Erro ao remover jogo", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Você precisa estar logado para ver seus favoritos
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ❤️ Meus Favoritos
          </h1>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {games.length} {games.length === 1 ? "jogo" : "jogos"}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <EmptyState
            icon="💔"
            title="Nenhum jogo favorito"
            message="Você ainda não tem jogos favoritos. Explore o catálogo e adicione jogos aos seus favoritos!"
            actionLabel="Explorar Jogos"
            onAction={() => (window.location.href = "/games")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {games.map((likedGame) => (
              <div key={likedGame.id} className="group relative">
                <Link to={`/games/${likedGame.game.gameId}`}>
                  <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition">
                    <img
                      src={
                        likedGame.game.background_image ||
                        "/placeholder-game.jpg"
                      }
                      alt={likedGame.game.name || "Game"}
                      className="w-full h-48 object-cover group-hover:scale-110 transition"
                    />
                    {/* Heart Badge */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg">
                      <span className="text-xl">❤️</span>
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                      <div className="p-3 w-full">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {likedGame.game.name ||
                            `Game #${likedGame.game.gameId}`}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFavorite(likedGame.game.gameId);
                  }}
                  className="absolute top-2 left-2 bg-white dark:bg-gray-800 text-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Remover dos favoritos"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
