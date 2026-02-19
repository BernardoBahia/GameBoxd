export interface ListGameItem {
  id: string;
  gameId: string;
  game: {
    id: string;
    gameId: string;
    isLiked: boolean;
    name?: string;
    background_image?: string;
    released?: string;
    metacritic?: number;
    gameboxdRating?: number;
    gameboxdRatingCount?: number;
    genres?: string[];
  };
}

export interface List {
  id: string;
  name: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string | null;
  listGames?: ListGameItem[];
}
