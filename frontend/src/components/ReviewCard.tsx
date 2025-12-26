import type { Review } from "../types";

interface ReviewCardProps {
  review: Review;
  onDelete?: (reviewId: number) => void;
  showDeleteButton?: boolean;
}

export default function ReviewCard({
  review,
  onDelete,
  showDeleteButton,
}: ReviewCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold">Usuário #{review.userId}</div>
          <div className="text-yellow-500 font-bold">⭐ {review.rating}/10</div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString("pt-BR")}
        </div>
      </div>
      <p className="text-gray-700 mb-3">{review.content}</p>
      {showDeleteButton && onDelete && (
        <button
          onClick={() => onDelete(review.id)}
          className="text-sm text-red-600 hover:text-red-800 transition"
        >
          Deletar
        </button>
      )}
    </div>
  );
}
