import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/AuthMiddleware";
import type { User } from "../models/user.model";

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}

const userService = new UserService();

export const UserController = {
  createUser: async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    const user = await userService.createUser(email, name, password);
    res.status(201).json(toPublicUser(user));
  },

  getAllUsers: async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users.map(toPublicUser));
  },

  getUserById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (user) {
      res.status(200).json(toPublicUser(user));
    } else {
      res.status(404).json({ message: "User not found" });
    }
  },

  updateUser: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const tokenUserId = req.user?.id;

    if (!tokenUserId || tokenUserId !== id) {
      return res.status(403).json({ error: "Sem permissão para editar este usuário" });
    }

    const { email, name, bio } = req.body;
    const updatedUser = await userService.updateUser(id, { email, name, bio });
    res.status(200).json(toPublicUser(updatedUser));
  },

  deleteUser: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const tokenUserId = req.user?.id;

    if (!tokenUserId || tokenUserId !== id) {
      return res.status(403).json({ error: "Sem permissão para deletar este usuário" });
    }

    await userService.deleteUser(id);
    res.status(204).send();
  },

  getUserStats: async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await userService.getUserStats(id);
    res.status(200).json(stats);
  },

  getUserWithPublicData: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserWithPublicData(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  },
};