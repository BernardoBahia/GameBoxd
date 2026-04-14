import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/AuthService";
import { UserService } from "../services/user.service";
import { getCache, setCache, deleteCache } from "../lib/redis";

const authService = new AuthService();
const userService = new UserService();

const USER_CACHE_TTL = 120; // 2 minutos

interface CachedUser {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

function cacheKey(userId: string) {
  return `auth:user:${userId}`;
}

async function resolveUser(userId: string): Promise<CachedUser | null> {
  const cached = await getCache<CachedUser>(cacheKey(userId));
  if (cached) return cached;

  const user = await userService.getUserById(userId);
  if (!user) return null;

  const data: CachedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
  };

  await setCache(cacheKey(userId), data, USER_CACHE_TTL);
  return data;
}

// Invalida o cache quando o usuário é atualizado (chamar de fora)
export async function invalidateUserCache(userId: string) {
  await deleteCache(cacheKey(userId));
}

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
    avatarUrl?: string | null;
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

    const user = await resolveUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = user;
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
    const user = await resolveUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};