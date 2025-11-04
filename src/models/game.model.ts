export interface Game {
  id: string;
  gameId: string;
}

export interface GameDLC {
  id: number;
  name: string;
  released: string;
}

export interface GameSummary {
  id: number;
  name: string;
  released: string;
  background_image: string;
}

export interface GameDetails {
  id: number;
  name: string;
  released: string;
  background_image: string;
  genres: string[];
  developers: string[];
  publishers: string[];
  platforms: string[];
  dlcs: GameDLC[];
}

export interface RawgGame {
  id: number;
  name: string;
  released: string;
  background_image: string;
  genres?: { name: string }[];
  developers?: { name: string }[];
  publishers?: { name: string }[];
  platforms?: { platform: { name: string } }[];
  additions?: { id: number; name: string; released: string }[];
}

export interface RawgListResponse {
  results: RawgGame[];
}
