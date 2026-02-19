import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import type { AuthRequest } from "../middlewares/AuthMiddleware";
import prisma from "../lib/prisma";

const reviewService = new ReviewService();

async function getOrCreateGameEntityByRawgId(rawgGameId: string) {
  const existing = await prisma.game.findUnique({
    where: { gameId: rawgGameId },
  });
  if (existing) return existing;
  return prisma.game.create({ data: { gameId: rawgGameId } });
}

export const ReviewController = {
  createReview: async (req: AuthRequest, res: Response) => {
    try {
      const tokenUserId = req.user?.id;
      const { userId: bodyUserId, gameId, rating, comment } = req.body;

      if (tokenUserId && bodyUserId && bodyUserId !== tokenUserId) {
        return res
          .status(403)
          .json({ error: "userId não corresponde ao token" });
      }

      const resolvedUserId = tokenUserId ?? bodyUserId;

      if (!resolvedUserId || !gameId || rating === undefined || !comment) {
        return res.status(400).json({
          error: "gameId, rating e comment são obrigatórios",
        });
      }

      if (rating < 0 || rating > 10) {
        return res.status(400).json({
          error: "Rating deve estar entre 0 e 10",
        });
      }

      // The frontend uses RAWG ids; our DB stores a separate Game entity.
      // Resolve/create the Game row first and use its UUID for the Review FK.
      const gameEntity = await getOrCreateGameEntityByRawgId(String(gameId));

      const review = await reviewService.createReview(
        resolvedUserId,
        gameEntity.id,
        rating,
        comment,
      );
      res.status(201).json(review);
    } catch (error) {
      console.error("Erro ao criar review:", error);
      res.status(500).json({ error: "Erro ao criar review" });
    }
  },

  getReviewsByGameId: async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;

      if (!gameId) {
        return res.status(400).json({ error: "gameId é obrigatório" });
      }

      // Accept either internal Game.id (UUID) or external RAWG id (stored in Game.gameId)
      const gameEntity = await prisma.game.findFirst({
        where: {
          OR: [{ id: String(gameId) }, { gameId: String(gameId) }],
        },
      });

      if (!gameEntity) {
        return res.status(200).json([]);
      }

      const reviews = await reviewService.getReviewsByGameId(gameEntity.id);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Erro ao buscar reviews do jogo:", error);
      res.status(500).json({ error: "Erro ao buscar reviews do jogo" });
    }
  },

  getReviewsByUserId: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const reviews = await reviewService.getReviewsByUserId(userId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Erro ao buscar reviews do usuário:", error);
      res.status(500).json({ error: "Erro ao buscar reviews do usuário" });
    }
  },

  getMyReviews: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Token inválido" });
      }

      const reviews = await reviewService.getReviewsByUserId(userId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Erro ao buscar minhas reviews:", error);
      res.status(500).json({ error: "Erro ao buscar minhas reviews" });
    }
  },

  getReviewById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "id é obrigatório" });
      }

      const review = await reviewService.getReviewById(id);

      if (!review) {
        return res.status(404).json({ error: "Review não encontrado" });
      }

      res.status(200).json(review);
    } catch (error) {
      console.error("Erro ao buscar review:", error);
      res.status(500).json({ error: "Erro ao buscar review" });
    }
  },

  updateReview: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, rating, comment } = req.body;

      if (!id || !userId) {
        return res.status(400).json({ error: "id e userId são obrigatórios" });
      }

      if (rating !== undefined && (rating < 0 || rating > 10)) {
        return res.status(400).json({
          error: "Rating deve estar entre 0 e 10",
        });
      }

      const data: { rating?: number; comment?: string } = {};
      if (rating !== undefined) data.rating = rating;
      if (comment !== undefined) data.comment = comment;

      const review = await reviewService.updateReview(id, userId, data);
      res.status(200).json(review);
    } catch (error) {
      console.error("Erro ao atualizar review:", error);
      if (error instanceof Error && error.message.includes("não encontrado")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro ao atualizar review" });
    }
  },

  deleteReview: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id || !userId) {
        return res.status(400).json({ error: "id e userId são obrigatórios" });
      }

      await reviewService.deleteReview(id, userId);
      res.status(200).json({ message: "Review deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar review:", error);
      res.status(500).json({ error: "Erro ao deletar review" });
    }
  },

  getAverageRating: async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;

      if (!gameId) {
        return res.status(400).json({ error: "gameId é obrigatório" });
      }

      // Accept either internal Game.id (UUID) or external RAWG id (stored in Game.gameId)
      const gameEntity = await prisma.game.findFirst({
        where: {
          OR: [{ id: String(gameId) }, { gameId: String(gameId) }],
        },
      });

      if (!gameEntity) {
        return res.status(200).json({
          gameId,
          averageRating: 0,
        });
      }

      const averageRating = await reviewService.getAverageRating(gameEntity.id);

      res.status(200).json({
        gameId,
        averageRating: averageRating ?? 0,
      });
    } catch (error) {
      console.error("Erro ao calcular média de rating:", error);
      res.status(500).json({ error: "Erro ao calcular média de rating" });
    }
  },
};
