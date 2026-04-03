export interface MeResponse {
  id: string;
  email: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UserStatsResponse {
  reviewsCount: number;
  listsCount: number;
  likedGamesCount: number;
  gamesCount: number;
  statusCounts: {
    playing: number;
    completed: number;
    wantToPlay: number;
  };
}
