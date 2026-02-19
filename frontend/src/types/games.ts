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

export interface GameDlc {
  id: number;
  name: string;
  released: string;
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
  dlcs: GameDlc[];
}

export interface PagedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
