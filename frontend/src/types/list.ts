export interface List {
  id: string;
  name: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt?: Date;
  listGames?: ListGame[];
}

export interface ListGame {
  id: string;
  listId: string;
  gameId: string;
  isPublic: boolean;
  createdAt: Date;
  game?: {
    id: string;
    gameId: string;
    isLiked: boolean;
    name?: string;
    background_image?: string;
    released?: string;
    genres?: string[];
  };
}

export interface CreateListRequest {
  name: string;
  userId: string;
}

export interface AddGameToListRequest {
  userId: string;
  gameId: string;
}
