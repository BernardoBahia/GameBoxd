export interface GameSummary {
  id: number;
  name: string;
  released: string;
  background_image: string;
}

export interface GameDetails extends GameSummary {
  genres: string[];
  developers: string[];
  publishers: string[];
  platforms: string[];
  dlcs: DLC[];
}

export interface DLC {
  id: number;
  name: string;
  released: string;
}

export interface Game {
  id: string;
  gameId: string;
  isLiked: boolean;
}

export type GameStatusType = "PLAYING" | "COMPLETED" | "WANT_TO_PLAY";

export interface UserGameStatus {
  id: string;
  userId: string;
  gameId: string;
  status: GameStatusType;
  createdAt: Date;
  updatedAt?: Date;
}
