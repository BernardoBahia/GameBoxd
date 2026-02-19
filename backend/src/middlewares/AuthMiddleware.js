"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const AuthService_1 = require("../services/auth/AuthService");
const user_service_1 = require("../services/user.service");
const authService = new AuthService_1.AuthService();
const userService = new user_service_1.UserService();
function extractBearerToken(authHeader) {
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
const authMiddleware = async (req, res, next) => {
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
exports.authMiddleware = authMiddleware;
// Token optional: if absent, continue unauthenticated.
// If present but invalid, returns 401.
const optionalAuthMiddleware = async (req, res, next) => {
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
exports.optionalAuthMiddleware = optionalAuthMiddleware;
