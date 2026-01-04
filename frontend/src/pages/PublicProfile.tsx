import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useToast } from "../contexts/ToastContext";
import { userService, gameService } from "../services";
import type { PublicUserProfile, UserStats, GameSummary } from "../types";
import { Navbar, SkeletonReviewCard, EmptyState } from "../components";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "lists">("reviews");
  const [gameDetails, setGameDetails] = useState<Map<string, GameSummary>>(
    new Map()
  );

  useEffect(() => {
    if (id) {
      fetchPublicProfile();
    }
  }, [id]);

  const fetchPublicProfile = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [publicData, userStats] = await Promise.all([
        userService.getUserPublicProfile(id),
        userService.getUserStats(id),
      ]);

      setProfile(publicData);
      setStats(userStats);

      const gameIds = new Set<string>();
      publicData.reviews.forEach((review) => gameIds.add(review.game.gameId));
      publicData.lists.forEach((list) =>
        list.listGames.forEach((lg) => gameIds.add(lg.game.gameId))
      );

      // Fetch game details
      const detailsMap = new Map<string, GameSummary>();
      await Promise.all(
        Array.from(gameIds).map(async (gameId) => {
          try {
            const game = await gameService.getGameDetails(Number(gameId));
            // Convert GameDetails to GameSummary
            detailsMap.set(gameId, {
              id: game.id,
              name: game.name,
              background_image: game.background_image,
              rating: game.rating,
              metacritic: game.metacritic,
              released: game.released,
            } as GameSummary);
          } catch (err) {
            console.error(`Failed to fetch game ${gameId}:`, err);
          }
        })
      );
      setGameDetails(detailsMap);
    } catch (err) {
      showToast("Erro ao carregar perfil do usuário", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonReviewCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <EmptyState
            icon="👤"
            title="Usuário não encontrado"
            message="Este perfil não existe ou foi removido."
            actionLabel="Voltar para Home"
            onAction={() => (window.location.href = "/")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 mb-6 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                {profile.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                Membro desde{" "}
                {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 text-center transition-colors">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
                  {stats.reviewsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Reviews
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center transition-colors">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors">
                  {stats.listsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Listas Públicas
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center transition-colors">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors">
                  {stats.statusCounts.playing}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Jogando
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center transition-colors">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 transition-colors">
                  {stats.statusCounts.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Completados
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 text-center transition-colors">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 transition-colors">
                  {stats.statusCounts.wantToPlay}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Quero Jogar
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 text-center transition-colors">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 transition-colors">
                  {stats.likedGamesCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Curtidos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 mb-6 transition-colors">
          <div className="flex border-b dark:border-gray-700 transition-colors">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === "reviews"
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Reviews ({profile.reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === "lists"
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Listas Públicas ({profile.lists.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors">
          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {profile.reviews.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="Nenhuma review"
                  message="Este usuário ainda não avaliou nenhum jogo."
                />
              ) : (
                profile.reviews.map((review) => {
                  const game = gameDetails.get(review.game.gameId);
                  return (
                    <div
                      key={review.id}
                      className="border-b dark:border-gray-700 pb-4 last:border-b-0 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link
                            to={`/games/${review.game.gameId}`}
                            className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          >
                            {game?.name || `Jogo #${review.game.gameId}`}
                          </Link>
                          <div className="text-yellow-500 font-bold">
                            ⭐ {review.rating}/10
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          {new Date(review.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 transition-colors">
                        {review.comment}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Lists Tab */}
          {activeTab === "lists" && (
            <div>
              {profile.lists.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="Nenhuma lista pública"
                  message="Este usuário não tem listas públicas ainda."
                />
              ) : (
                <div className="space-y-6">
                  {profile.lists.map((list) => (
                    <div
                      key={list.id}
                      className="border dark:border-gray-700 rounded-lg p-4 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                        {list.name}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal transition-colors">
                          ({list.listGames.length} jogos)
                        </span>
                      </h3>
                      {list.listGames.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">
                          Lista vazia
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {list.listGames.map((lg) => {
                            const game = gameDetails.get(lg.game.gameId);
                            return (
                              <Link
                                key={lg.id}
                                to={`/games/${lg.game.gameId}`}
                                className="group"
                              >
                                <img
                                  src={
                                    game?.background_image ||
                                    "/placeholder-game.jpg"
                                  }
                                  alt={game?.name || "Game"}
                                  className="w-full h-32 object-cover rounded-lg shadow group-hover:shadow-lg transition"
                                />
                                <h4 className="mt-2 font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                                  {game?.name || `Jogo #${lg.game.gameId}`}
                                </h4>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
