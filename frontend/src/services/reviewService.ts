import api from "./api";
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "../types";

export const reviewService = {
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post("/reviews", data);
    return response.data;
  },

  async getReviewsByGameId(gameId: string): Promise<Review[]> {
    const response = await api.get(`/reviews/game/${gameId}`);
    return response.data;
  },

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  async getReviewById(id: string): Promise<Review> {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  async updateReview(
    id: string,
    userId: string,
    data: UpdateReviewRequest
  ): Promise<Review> {
    const response = await api.put(`/reviews/${id}`, {
      userId,
      ...data,
    });
    return response.data;
  },

  async deleteReview(id: string, userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/reviews/${id}`, {
      data: { userId },
    });
    return response.data;
  },

  async getAverageRating(
    gameId: string
  ): Promise<{ gameId: string; averageRating: number }> {
    const response = await api.get(`/reviews/game/${gameId}/average`);
    return response.data;
  },
};
