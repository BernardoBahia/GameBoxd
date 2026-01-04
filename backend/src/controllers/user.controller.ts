import { UserService } from "../services/user.service";
import { Request, Response } from "express";

export const UserController = {
  createUser: async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    const userService = new UserService();
    const user = await userService.createUser(email, name, password);
    res.status(201).json(user);
  },

  getAllUsers: async (req: Request, res: Response) => {
    const userService = new UserService();
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  },

  getUserById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userService = new UserService();
    const user = await userService.getUserById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const userService = new UserService();
    const updatedUser = await userService.updateUser(id, data);
    res.status(200).json(updatedUser);
  },

  deleteUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userService = new UserService();
    await userService.deleteUser(id);
    res.status(204).send();
  },

  getUserStats: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userService = new UserService();
    const stats = await userService.getUserStats(id);
    res.status(200).json(stats);
  },

  getUserWithPublicData: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userService = new UserService();
    const user = await userService.getUserWithPublicData(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  },
};
