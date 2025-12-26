import { Link } from "react-router";
import type { GameSummary } from "../types";

interface GameCardProps {
  game: GameSummary;
  onLike?: (gameId: number) => void;
}

export default function GameCard({ game, onLike }: GameCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105">
      <Link to={`/games/${game.id}`}>
        <img
          src={game.background_image || "/placeholder-game.jpg"}
          alt={game.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
        />
      </Link>
      <div className="p-4">
        <Link to={`/games/${game.id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-indigo-600 transition">
            {game.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">
          {new Date(game.released).getFullYear()}
        </p>
        <div className="flex justify-between items-center mt-3">
          {onLike && (
            <button
              onClick={() => onLike(game.id)}
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              ❤️ Curtir
            </button>
          )}
          <Link
            to={`/games/${game.id}`}
            className="text-sm text-gray-600 hover:text-gray-800 transition"
          >
            Ver detalhes →
          </Link>
        </div>
      </div>
    </div>
  );
}
