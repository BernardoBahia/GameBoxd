export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserStats {
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

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    game: {
      id: string;
      gameId: string;
    };
  }>;
  lists: Array<{
    id: string;
    name: string;
    isPublic: boolean;
    createdAt: string;
    listGames: Array<{
      id: string;
      gameId: string;
      game: {
        id: string;
        gameId: string;
      };
    }>;
  }>;
}
