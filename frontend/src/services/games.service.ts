import { apiFetch } from "@/services/api";
import type {
  GameDetails,
  GameDlc,
  GameSummary,
  PagedResponse,
} from "@/types/games";
import type { GenreSummary } from "@/types/genres";
import type { Review } from "@/types/reviews";

export interface LikeGameResponse {
  message: string;
  liked: boolean;
}

export const gamesService = {
  getGenres() {
    return apiFetch<GenreSummary[]>(`/genres`);
  },
  getHighlights(page = 1, pageSize = 10) {
    return apiFetch<PagedResponse<GameSummary>>(
      `/games/highlights?page=${page}&pageSize=${pageSize}`
    );
  },
  getGames(params: {
    page?: number;
    pageSize?: number;
    platforms?: string;
    genres?: string;
    dates?: string;
    ordering?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      platforms,
      genres,
      dates,
      ordering,
    } = params;

    const qs = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(platforms ? { platforms } : {}),
      ...(genres ? { genres } : {}),
      ...(dates ? { dates } : {}),
      ...(ordering ? { ordering } : {}),
    });

    return apiFetch<PagedResponse<GameSummary>>(`/games?${qs.toString()}`);
  },
  searchGames(params: {
    query: string;
    page?: number;
    pageSize?: number;
    ordering?: string;
    genres?: string;
  }) {
    const { query, page = 1, pageSize = 10, ordering, genres } = params;

    const qs = new URLSearchParams({
      query: String(query),
      page: String(page),
      pageSize: String(pageSize),
      ...(ordering ? { ordering } : {}),
      ...(genres ? { genres } : {}),
    });

    return apiFetch<PagedResponse<GameSummary>>(
      `/games/search?${qs.toString()}`
    );
  },
  getGameDetails(gameId: string | number) {
    return apiFetch<GameDetails>(`/games/${gameId}`);
  },
  getGameReviews(gameId: string | number) {
    return apiFetch<Review[]>(`/games/${gameId}/reviews`);
  },
  getGameDlcs(gameId: string | number) {
    return apiFetch<GameDlc[]>(`/games/${gameId}/dlcs`);
  },
  likeGame(gameId: string, token?: string) {
    return apiFetch<LikeGameResponse>("/games/like", {
      method: "POST",
      body: JSON.stringify({ gameId }),
      token,
    });
  },
  getMyLikedGames(token?: string) {
    return apiFetch<string[]>("/games/liked", { token });
  },
  // Back-compat / admin use
  getUserLikedGames(userId: string, token?: string) {
    return apiFetch<string[]>(`/games/liked/${userId}`, { token });
  },
};
