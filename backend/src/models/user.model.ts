export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
