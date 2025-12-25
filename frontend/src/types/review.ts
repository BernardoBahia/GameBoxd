export interface Review {
  id: string;
  userId: string;
  gameId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  game?: {
    id: string;
    gameId: string;
    isLiked: boolean;
  };
}

export interface CreateReviewRequest {
  userId: string;
  gameId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
