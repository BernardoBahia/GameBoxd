import { Review } from "../models/review.model";
import prisma from "../lib/prisma";

export class ReviewService {
  async createReview(
    userId: string,
    gameId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    try {
      const createdReview = await prisma.review.create({
        data: {
          userId,
          gameId,
          rating,
          comment,
        },
      });

      return {
        ...createdReview,
        updatedAt: createdReview.updatedAt ?? undefined,
      };
    } catch (error) {
      console.error("Erro ao criar review:", error);
      throw new Error("Falha ao criar review");
    }
  }

  async getReviewsByGameId(gameId: string): Promise<Review[]> {
    try {
      const rows = await prisma.$queryRaw<
        Array<{
          id: string;
          userId: string;
          gameId: string;
          rating: number;
          comment: string;
          createdAt: Date;
          updatedAt: Date | null;
          userName: string | null;
          userEmail: string | null;
          userAvatarUrl: string | null;
        }>
      >`
        SELECT
          r.id, r."userId", r."gameId", r.rating, r.comment,
          r."createdAt", r."updatedAt",
          u.name AS "userName", u.email AS "userEmail", u."avatarUrl" AS "userAvatarUrl"
        FROM "Review" r
        LEFT JOIN "User" u ON r."userId" = u.id
        WHERE r."gameId" = ${gameId}
        ORDER BY r."createdAt" DESC
      `;

      return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        gameId: row.gameId,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? undefined,
        user: row.userName
          ? {
              id: row.userId,
              name: row.userName,
              email: row.userEmail ?? "",
              avatarUrl: row.userAvatarUrl,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Erro ao buscar reviews do jogo:", error);
      throw new Error("Falha ao buscar reviews do jogo");
    }
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          game: true,
        },
      });

      return reviews.map((review) => ({
        ...review,
        updatedAt: review.updatedAt ?? undefined,
      }));
    } catch (error) {
      console.error("Erro ao buscar reviews do usuário:", error);
      throw new Error("Falha ao buscar reviews do usuário");
    }
  }

  async getReviewById(id: string): Promise<Review | null> {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          game: true,
        },
      });

      return review
        ? {
            ...review,
            updatedAt: review.updatedAt ?? undefined,
          }
        : null;
    } catch (error) {
      console.error("Erro ao buscar review por ID:", error);
      throw new Error("Falha ao buscar review por ID");
    }
  }

  async updateReview(
    id: string,
    userId: string,
    data: { rating?: number; comment?: string },
  ): Promise<Review> {
    try {
      const existingReview = await prisma.review.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingReview) {
        throw new Error("Review não encontrado ou sem permissão");
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data,
      });

      return {
        ...updatedReview,
        updatedAt: updatedReview.updatedAt ?? undefined,
      };
    } catch (error) {
      console.error("Erro ao atualizar review:", error);

      if (
        error instanceof Error &&
        error.message === "Review não encontrado ou sem permissão"
      ) {
        throw error;
      }

      throw new Error("Falha ao atualizar review");
    }
  }

  async deleteReview(id: string, userId: string): Promise<void> {
    try {
      await prisma.review.deleteMany({
        where: {
          id,
          userId,
        },
      });
    } catch (error) {
      console.error("Erro ao deletar review:", error);
      throw new Error("Falha ao deletar review");
    }
  }

  async getAverageRating(gameId: string): Promise<number | null> {
    try {
      const result = await prisma.review.aggregate({
        where: { gameId },
        _avg: {
          rating: true,
        },
      });

      return result._avg.rating;
    } catch (error) {
      console.error("Erro ao calcular média de rating:", error);
      throw new Error("Falha ao calcular média de rating");
    }
  }
}
