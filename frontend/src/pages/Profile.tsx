import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { reviewService, gameService } from "../services";
import type { Review, GameSummary } from "../types";
import {
  Navbar,
  SkeletonReviewCard,
  SkeletonGameCard,
  EmptyState,
} from "../components";

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likedGames, setLikedGames] = useState<GameSummary[]>([]);
  const [gamesByStatus, setGamesByStatus] = useState<{
    playing: GameSummary[];
    completed: GameSummary[];
    wantToPlay: GameSummary[];
  }>({
    playing: [],
    completed: [],
    wantToPlay: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "liked" | "status">(
    "reviews"
  );

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar reviews do usuário
      const userReviews = await reviewService.getReviewsByUserId(user.id);
      setReviews(userReviews);

      // Buscar jogos curtidos
      const liked = await gameService.getUserLikedGames(user.id);
      setLikedGames(liked);

      // Buscar jogos por status
      const playing = await gameService.getUserGamesByStatus(
        user.id,
        "PLAYING"
      );
      const completed = await gameService.getUserGamesByStatus(
        user.id,
        "COMPLETED"
      );
      const wantToPlay = await gameService.getUserGamesByStatus(
        user.id,
        "WANT_TO_PLAY"
      );

      setGamesByStatus({
        playing,
        completed,
        wantToPlay,
      });
    } catch (err) {
      showToast("Erro ao carregar dados do perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user || !confirm("Deseja realmente deletar esta review?")) return;

    try {
      await reviewService.deleteReview(reviewId, user.id);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      showToast("Review deletada com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao deletar review", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Você precisa estar logado para ver seu perfil
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {reviews.length}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {gamesByStatus.completed.length}
              </div>
              <div className="text-sm text-gray-600">Jogos Completados</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">
                {likedGames.length}
              </div>
              <div className="text-sm text-gray-600">Jogos Curtidos</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === "reviews"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Minhas Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("liked")}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === "liked"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Jogos Curtidos ({likedGames.length})
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === "status"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Status dos Jogos
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="Nenhuma review ainda"
                  message="Você ainda não avaliou nenhum jogo. Explore o catálogo e compartilhe suas opiniões!"
                  actionLabel="Explorar Jogos"
                  onAction={() => (window.location.href = "/games")}
                />
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          to={`/games/${review.gameId}`}
                          className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Jogo #{review.gameId}
                        </Link>
                        <div className="text-yellow-500 font-bold">
                          ⭐ {review.rating}/10
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-sm text-red-600 hover:text-red-800 transition"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Liked Games Tab */}
          {activeTab === "liked" && (
            <div>
              {likedGames.length === 0 ? (
                <EmptyState
                  icon="❤️"
                  title="Nenhum jogo curtido"
                  message="Explore o catálogo e curta seus jogos favoritos para mantê-los aqui!"
                  actionLabel="Explorar Jogos"
                  onAction={() => (window.location.href = "/games")}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {likedGames.map((game) => (
                    <Link
                      key={game.id}
                      to={`/games/${game.id}`}
                      className="group"
                    >
                      <img
                        src={game.background_image || "/placeholder-game.jpg"}
                        alt={game.name}
                        className="w-full h-40 object-cover rounded-lg shadow group-hover:shadow-lg transition"
                      />
                      <h3 className="mt-2 font-semibold text-sm group-hover:text-indigo-600 transition">
                        {game.name}
                      </h3>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status Tab */}
          {activeTab === "status" && (
            <div className="space-y-8">
              {/* Jogando */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-600">🎮</span> Jogando (
                  {gamesByStatus.playing.length})
                </h3>
                {gamesByStatus.playing.length === 0 ? (
                  <p className="text-gray-600">Nenhum jogo em andamento</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {gamesByStatus.playing.map((game) => (
                      <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className="group"
                      >
                        <img
                          src={game.background_image || "/placeholder-game.jpg"}
                          alt={game.name}
                          className="w-full h-40 object-cover rounded-lg shadow group-hover:shadow-lg transition"
                        />
                        <h3 className="mt-2 font-semibold text-sm group-hover:text-indigo-600 transition">
                          {game.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Completados */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-green-600">✅</span> Completados (
                  {gamesByStatus.completed.length})
                </h3>
                {gamesByStatus.completed.length === 0 ? (
                  <p className="text-gray-600">Nenhum jogo completado ainda</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {gamesByStatus.completed.map((game) => (
                      <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className="group"
                      >
                        <img
                          src={game.background_image || "/placeholder-game.jpg"}
                          alt={game.name}
                          className="w-full h-40 object-cover rounded-lg shadow group-hover:shadow-lg transition"
                        />
                        <h3 className="mt-2 font-semibold text-sm group-hover:text-indigo-600 transition">
                          {game.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quero Jogar */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-purple-600">📝</span> Quero Jogar (
                  {gamesByStatus.wantToPlay.length})
                </h3>
                {gamesByStatus.wantToPlay.length === 0 ? (
                  <p className="text-gray-600">
                    Nenhum jogo na lista de desejos
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {gamesByStatus.wantToPlay.map((game) => (
                      <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className="group"
                      >
                        <img
                          src={game.background_image || "/placeholder-game.jpg"}
                          alt={game.name}
                          className="w-full h-40 object-cover rounded-lg shadow group-hover:shadow-lg transition"
                        />
                        <h3 className="mt-2 font-semibold text-sm group-hover:text-indigo-600 transition">
                          {game.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
