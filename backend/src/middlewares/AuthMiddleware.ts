import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/AuthService";
import { UserService } from "../services/user.service";

const authService = new AuthService();
const userService = new UserService();

function extractBearerToken(authHeader: string): string | null {
  const trimmed = authHeader.trim();
  if (!trimmed) return null;

  const match = /^Bearer\s+(.+)$/i.exec(trimmed);
  const rawToken = (match ? match[1] : trimmed).trim();
  if (!rawToken) return null;

  const unquoted = rawToken
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();

  return unquoted || null;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    bio?: string | null;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = extractBearerToken(authHeader);
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = authService.verifyToken(token);

    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio ?? null,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Token optional: if absent, continue unauthenticated.
// If present but invalid, returns 401.
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  try {
    const token = extractBearerToken(authHeader);
    if (!token) {
      return next();
    }
    const decoded = authService.verifyToken(token);
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio ?? null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
