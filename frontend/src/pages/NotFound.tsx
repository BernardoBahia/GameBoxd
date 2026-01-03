import { Link } from "react-router-dom";
import { Navbar } from "../components";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
          {/* 404 Text */}
          <div className="relative mb-8">
            <h1 className="text-[150px] md:text-[200px] font-black text-gray-200 dark:text-gray-800 leading-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl md:text-8xl">🎮</span>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Página Não Encontrada
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Ops! Parece que você se perdeu. A página que você está procurando
            não existe ou foi movida.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>🏠</span>
              Voltar para Home
            </Link>
            <Link
              to="/games"
              className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>🎯</span>
              Explorar Jogos
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              O que você pode fazer?
            </h3>
            <ul className="space-y-2 text-left text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-1">
                  ✓
                </span>
                <span>Verificar se o endereço digitado está correto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-1">
                  ✓
                </span>
                <span>Voltar para a página inicial</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-1">
                  ✓
                </span>
                <span>Explorar nosso catálogo de jogos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-1">
                  ✓
                </span>
                <span>Usar a navegação do menu acima</span>
              </li>
            </ul>
          </div>

          {/* Decorative Elements */}
          <div className="mt-12 flex gap-4 text-4xl opacity-50">
            <span className="animate-bounce">🕹️</span>
            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
              👾
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
              🎲
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>
              🏆
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
