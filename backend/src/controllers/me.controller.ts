import type { Response } from "express";
import type { AuthRequest } from "../middlewares/AuthMiddleware";
import { invalidateUserCache } from "../middlewares/AuthMiddleware";
import { UserService } from "../services/user.service";
import prisma from "../lib/prisma";

const userService = new UserService();

function sanitizeName(raw: unknown): string {
  if (!raw || typeof raw !== "string") throw new Error("name_invalid");
  const trimmed = raw.trim();
  if (trimmed.length < 2) throw new Error("name_too_short");
  if (trimmed.length > 50) throw new Error("name_too_long");
  if (!/^[\p{L}\p{N} '_\-\.]+$/u.test(trimmed)) throw new Error("name_invalid_chars");
  return trimmed;
}

function sanitizeBio(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > 280) throw new Error("bio_too_long");
  return trimmed;
}

export const MeController = {
  getMe: async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Token inválido" });

    try {
      const rows = await prisma.$queryRaw<Array<{ avatarUrl: string | null }>>`
        SELECT "avatarUrl" FROM "User" WHERE id = ${userId} LIMIT 1
      `;
      return res.json({ ...req.user, avatarUrl: rows[0]?.avatarUrl ?? null });
    } catch {
      return res.json(req.user);
    }
  },

  postAvatar: async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Token inválido" });
    if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    try {
      await prisma.$executeRaw`UPDATE "User" SET "avatarUrl" = ${avatarUrl} WHERE "id" = ${userId}`;
      await invalidateUserCache(userId);
      return res.status(200).json({
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.name,
        bio: req.user!.bio ?? null,
        avatarUrl,
      });
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      return res.status(500).json({ error: "Erro ao salvar avatar" });
    }
  },

  patchName: async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Token não fornecido" });

    let name: string;
    try {
      name = sanitizeName((req.body as any)?.name);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === "name_too_short") return res.status(400).json({ error: "Nome deve ter no mínimo 2 caracteres" });
      if (msg === "name_too_long") return res.status(400).json({ error: "Nome deve ter no máximo 50 caracteres" });
      if (msg === "name_invalid_chars") return res.status(400).json({ error: "Nome contém caracteres inválidos" });
      return res.status(400).json({ error: "Nome inválido" });
    }

    try {
      const existing = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "User" WHERE name = ${name} AND id != ${userId} LIMIT 1
      `;
      if (existing.length > 0) {
        return res.status(409).json({ error: "Este nome já está em uso" });
      }

      const updated = await userService.updateUser(userId, { name });
      await invalidateUserCache(userId);
      return res.status(200).json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        bio: updated.bio ?? null,
        avatarUrl: updated.avatarUrl ?? null,
      });
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      return res.status(500).json({ error: "Erro ao atualizar nome" });
    }
  },

  patchMe: async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Token não fornecido" });

    let bio: string | null | undefined;
    try {
      bio = sanitizeBio((req.body as any)?.bio);
    } catch (e) {
      if ((e as Error).message === "bio_too_long") {
        return res.status(400).json({ error: "Bio deve ter no máximo 280 caracteres" });
      }
      return res.status(400).json({ error: "Bio inválida" });
    }

    if (bio === undefined) {
      return res.status(400).json({ error: "bio é obrigatório" });
    }

    try {
      const updated = await userService.updateUser(userId, { bio });
      await invalidateUserCache(userId);
      return res.status(200).json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        bio: updated.bio ?? null,
        avatarUrl: updated.avatarUrl ?? null,
      });
    } catch (error) {
      console.error("Erro ao atualizar bio:", error);
      return res.status(500).json({ error: "Erro ao atualizar bio" });
    }
  },
};