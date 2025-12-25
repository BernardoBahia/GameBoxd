export interface Review {
  id: string;
  userId: string;
  gameId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}
