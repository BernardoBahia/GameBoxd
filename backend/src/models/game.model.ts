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
  rating?: number;
  metacritic?: number;
  // Average rating from this app's reviews (0..5).
  gameboxdRating?: number;
  gameboxdRatingCount?: number;
  genres?: string[];
}

export interface GameDetails {
  id: number;
  name: string;
  released: string;
  background_image: string;
  rating?: number;
  metacritic?: number;
  // Average rating from this app's reviews (0..5).
  gameboxdRating?: number;
  gameboxdRatingCount?: number;
  description?: string;
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
  rating?: number;
  metacritic?: number;
  description?: string;
  description_raw?: string;
  genres?: { name: string }[];
  developers?: { name: string }[];
  publishers?: { name: string }[];
  platforms?: { platform: { name: string } }[];
  additions?: { id: number; name: string; released: string }[];
}

export interface RawgListResponse {
  results: RawgGame[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface GenreSummary {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGenreListResponse {
  results: RawgGenre[];
  count: number;
  next: string | null;
  previous: string | null;
}
