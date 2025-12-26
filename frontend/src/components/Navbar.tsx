import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            GameBoxd
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              to="/games"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Jogos
            </Link>

            {user ? (
              <>
                <Link
                  to="/my-lists"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Minhas Listas
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Perfil
                </Link>
                <span className="text-gray-600">Olá, {user.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
