import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/AuthService";
import { UserService } from "../services/user.service";

const authService = new AuthService();
const userService = new UserService();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = authService.verifyToken(token);

    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
