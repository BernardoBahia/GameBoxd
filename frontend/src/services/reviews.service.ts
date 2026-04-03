import { apiFetch } from "@/services/api";
import type { Review } from "@/types/reviews";

export interface CreateReviewRequest {
  gameId: string;
  rating: number; // 0..10
  comment: string;
}

export const reviewsService = {
  createReview(body: CreateReviewRequest, token?: string) {
    return apiFetch<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },
  getMyReviews(token?: string) {
    return apiFetch<Review[]>("/reviews/me", { token });
  },
  updateReview(
    id: string,
    body: { userId: string; rating?: number; comment?: string },
    token?: string,
  ) {
    return apiFetch<Review>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },
  deleteReview(id: string, userId: string, token?: string) {
    return apiFetch<{ message: string }>(`/reviews/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
      token,
    });
  },
};
