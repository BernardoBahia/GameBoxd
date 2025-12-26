import { Link } from "react-router";
import type { GameSummary } from "../types";

interface GameCardProps {
  game: GameSummary;
  onLike?: (gameId: number) => void;
}

export default function GameCard({ game, onLike }: GameCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <Link to={`/games/${game.id}`}>
        <img
          src={game.background_image || "/placeholder-game.jpg"}
          alt={game.name}
          className="w-full h-48 object-cover"
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
              className="text-sm text-indigo-600 hover:text-indigo-800 transition"
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
