import api from "./api";
import type {
  GameSummary,
  GameDetails,
  GameStatusType,
  UserGameStatus,
} from "../types";

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export const gameService = {
  async getGames(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<GameSummary>> {
    const response = await api.get("/games", {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getTrendingGames(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<GameSummary>> {
    const response = await api.get("/games/trending", {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getRecentGames(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<GameSummary>> {
    const response = await api.get("/games/recent", {
      params: { page, pageSize },
    });
    return response.data;
  },

  async searchGames(
    query: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<GameDetails>> {
    const response = await api.get("/games/search", {
      params: { query, page, pageSize },
    });
    return response.data;
  },

  async searchGamesByPlatform(
    platformId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> {
    const response = await api.get(`/games/platform/${platformId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  async searchGamesByGenre(
    genreId: number,
    page = 1,
    pageSize = 10
  ): Promise<GameDetails[]> {
    const response = await api.get(`/games/genre/${genreId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getGameDetails(gameId: number): Promise<GameDetails> {
    const response = await api.get(`/games/details/${gameId}`);
    return response.data;
  },

  async likeGame(userId: string, gameId: string): Promise<{ message: string }> {
    const response = await api.post("/games/like", {
      userId,
      gameId,
    });
    return response.data;
  },

  async getUserLikedGames(userId: string): Promise<any[]> {
    const response = await api.get(`/games/liked/${userId}`);
    return response.data;
  },

  async setGameStatus(
    userId: string,
    gameId: string,
    status: GameStatusType
  ): Promise<UserGameStatus> {
    const response = await api.post("/games/status", {
      userId,
      gameId,
      status,
    });
    return response.data;
  },

  async removeGameStatus(
    userId: string,
    gameId: string
  ): Promise<{ message: string }> {
    const response = await api.delete("/games/status", {
      data: { userId, gameId },
    });
    return response.data;
  },

  async getUserGamesByStatus(
    userId: string,
    status?: GameStatusType
  ): Promise<any[]> {
    const response = await api.get(`/games/status/${userId}`, {
      params: status ? { status } : undefined,
    });
    return response.data;
  },
};
