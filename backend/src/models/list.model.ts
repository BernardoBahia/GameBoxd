export interface List {
  id: string;
  name: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  listGames?: {
    id: string;
    gameId: string;
    game: {
      id: string;
      gameId: string;
      isLiked: boolean;
      name?: string;
      background_image?: string;
      released?: string;
      genres?: string[];
    };
  }[];
}
