export interface ReviewUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Review {
  id: string;
  userId: string;
  gameId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: ReviewUser;
  game?: {
    id: string;
    gameId: string;
    isLiked?: boolean;
  };
}
