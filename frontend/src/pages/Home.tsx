import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            GameBoxd
          </h1>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Olá, {user?.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bem-vindo ao GameBoxd!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Descubra, avalie e organize seus jogos favoritos.
        </p>
        {isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Suas Funcionalidades
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Buscar e descobrir jogos</li>
              <li>✓ Avaliar jogos com notas e comentários</li>
              <li>✓ Criar listas personalizadas</li>
              <li>✓ Marcar jogos como jogado, jogando ou quero jogar</li>
            </ul>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800 mb-4">
              Faça login ou cadastre-se para começar a usar o GameBoxd!
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fazer Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
