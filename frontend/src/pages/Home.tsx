import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { gameService, reviewService } from "../services";
import type { GameSummary, Review } from "../types";
import { Navbar, Skeleton } from "../components";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<GameSummary[]>([]);
  const [topRatedGames, setTopRatedGames] = useState<GameSummary[]>([]);
  const [recentGames, setRecentGames] = useState<GameSummary[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalReviews: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Buscar jogos mais em alta (ordenados por metacritic e rating)
      const trendingGamesResponse = await gameService.getTrendingGames(1, 3);
      setFeaturedGames(trendingGamesResponse.results);

      // Buscar jogos bem avaliados (ordenação padrão da API)
      const topGamesResponse = await gameService.getGames(1, 4);
      setTopRatedGames(topGamesResponse.results);

      // Buscar jogos recentes (últimos 3 meses)
      const recentGamesResponse = await gameService.getRecentGames(1, 6);
      setRecentGames(recentGamesResponse.results);

      // Estatísticas
      setStats({
        totalGames: trendingGamesResponse.count,
        totalReviews: 0,
        totalUsers: 0,
      });

      // Buscar reviews recentes se estiver autenticado
      if (user) {
        try {
          const reviews = await reviewService.getReviewsByUserId(user.id);
          setRecentReviews(reviews.slice(0, 3));
        } catch (err) {
          // Ignorar erro se não houver reviews
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors animate-fade-in">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 rounded-2xl overflow-hidden shadow-2xl mb-12">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 px-8 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Bem-vindo ao GameBoxd
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Descubra, avalie e organize seus jogos favoritos em um só lugar
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
                >
                  Criar Conta Grátis
                </Link>
                <Link
                  to="/games"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition transform hover:scale-105"
                >
                  Explorar Jogos
                </Link>
              </div>
            ) : (
              <Link
                to="/games"
                className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Explorar Catálogo
              </Link>
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition">
            <div className="text-4xl mb-2">🎮</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {stats.totalGames.toLocaleString()}+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Jogos no Catálogo
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {recentReviews.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Suas Avaliações
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {isAuthenticated ? "Ativo" : "Inativo"}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Status da Conta
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              🔥 Jogos Mais em Alta
            </h2>
            <Link
              to="/games"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="group relative overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition"
              >
                <img
                  src={game.background_image || "/placeholder-game.jpg"}
                  alt={game.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {game.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white">{game.rating || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Rated Games */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              ⭐ Melhores Avaliados
            </h2>
            <Link
              to="/games"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topRatedGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={game.background_image || "/placeholder-game.jpg"}
                  alt={game.name}
                  className="w-full h-40 object-cover group-hover:scale-110 transition"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {game.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-yellow-400">★</span>
                    <span>{game.rating || "N/A"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Reviews */}
        {isAuthenticated && recentReviews.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                💬 Suas Avaliações Recentes
              </h2>
              <Link
                to="/profile"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link
                        to={`/games/${review.gameId}`}
                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Jogo #{review.gameId}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Games */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎯 Jogos Recentes
            </h2>
            <Link
              to="/games"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentGames.map((game) => (
              <Link key={game.id} to={`/games/${game.id}`} className="group">
                <img
                  src={game.background_image || "/placeholder-game.jpg"}
                  alt={game.name}
                  className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-xl transition group-hover:scale-105"
                />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {game.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="bg-indigo-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Crie sua conta grátis e comece a organizar sua biblioteca de
              jogos, avaliar e descobrir novos títulos!
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105 shadow-lg"
            >
              Criar Conta Grátis
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
