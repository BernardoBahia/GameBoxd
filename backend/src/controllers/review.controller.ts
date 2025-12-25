import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";

const reviewService = new ReviewService();

export const ReviewController = {
  createReview: async (req: Request, res: Response) => {
    try {
      const { userId, gameId, rating, comment } = req.body;

      if (!userId || !gameId || rating === undefined || !comment) {
        return res.status(400).json({
          error: "userId, gameId, rating e comment são obrigatórios",
        });
      }

      if (rating < 0 || rating > 10) {
        return res.status(400).json({
          error: "Rating deve estar entre 0 e 10",
        });
      }

      const review = await reviewService.createReview(
        userId,
        gameId,
        rating,
        comment
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

      const reviews = await reviewService.getReviewsByGameId(gameId);
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

      const averageRating = await reviewService.getAverageRating(gameId);

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
