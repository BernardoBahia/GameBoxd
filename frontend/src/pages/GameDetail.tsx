import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { gameService, reviewService } from "../services";
import type { GameDetails, Review } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  Navbar,
  SkeletonReviewCard,
  EmptyState,
  Skeleton,
  AddToListModal,
} from "../components";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const gameId = id!;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add to list modal
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  useEffect(() => {
    fetchGameData();
  }, [gameId]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError("");

      // Buscar detalhes do jogo
      const gameData = await gameService.getGameDetails(parseInt(gameId));
      setGame(gameData);

      // Buscar reviews
      const reviewsData = await reviewService.getReviewsByGameId(gameId);
      setReviews(reviewsData);

      // Buscar rating médio
      const avgData = await reviewService.getAverageRating(gameId);
      setAvgRating(avgData.averageRating);
    } catch (err) {
      setError("Erro ao carregar dados do jogo");
      showToast("Erro ao carregar dados do jogo", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmittingReview(true);
      const newReview = await reviewService.createReview({
        userId: user.id,
        gameId,
        rating: reviewRating,
        comment: reviewContent,
      });
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setReviewContent("");
      setReviewRating(5);
      // Atualizar rating médio
      const avgData = await reviewService.getAverageRating(gameId);
      setAvgRating(avgData.averageRating);
      showToast("Review publicada com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao criar review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, userId: string) => {
    if (!confirm("Deseja realmente deletar esta review?")) return;

    try {
      await reviewService.deleteReview(reviewId, userId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      // Atualizar rating médio
      const avgData = await reviewService.getAverageRating(gameId);
      setAvgRating(avgData.averageRating);
      showToast("Review deletada com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao deletar review", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="w-full h-96 mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonReviewCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error || "Jogo não encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Info */}
          <div className="lg:col-span-1">
            <img
              src={game.background_image || "/placeholder-game.jpg"}
              alt={game.name}
              className="w-full rounded-lg shadow-lg mb-4"
            />
          </div>

          {/* Game Details & Reviews */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              {game.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-lg text-gray-600">
                {new Date(game.released).getFullYear()}
              </span>
              <span className="text-2xl font-bold text-yellow-500">
                ⭐ {avgRating.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {game.genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>

            {game.platforms && game.platforms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Plataformas</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to List Button */}
            {user && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAddToListModal(true)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="text-xl">➕</span>
                  Adicionar à Lista
                </button>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Reviews ({reviews.length})
                </h2>
                {user && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Escrever Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-white p-6 rounded-lg shadow mb-6"
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Nota (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={reviewRating}
                      onChange={(e) =>
                        setReviewRating(parseInt(e.target.value))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Review
                    </label>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Escreva sua opinião sobre o jogo..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {submittingReview ? "Enviando..." : "Publicar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold">
                          Usuário #{review.userId}
                        </div>
                        <div className="text-yellow-500 font-bold">
                          ⭐ {review.rating}/10
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    {user && user.id === review.userId && (
                      <button
                        onClick={() =>
                          handleDeleteReview(review.id, review.userId)
                        }
                        className="text-sm text-red-600 hover:text-red-800 transition"
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {reviews.length === 0 && (
                <EmptyState
                  icon="📝"
                  title="Nenhuma review ainda"
                  message="Seja o primeiro a avaliar este jogo e compartilhar sua opinião!"
                  actionLabel={user ? "Escrever Review" : undefined}
                  onAction={user ? () => setShowReviewForm(true) : undefined}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add to List Modal */}
      {game && (
        <AddToListModal
          gameId={gameId}
          gameName={game.name}
          isOpen={showAddToListModal}
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </div>
  );
}
