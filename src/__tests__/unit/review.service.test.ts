import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import { PrismaClient } from "@prisma/client";
import { ReviewService } from "../../services/review.service";
import { Review } from "../../models/review.model";

vi.mock("@prisma/client", () => {
  const mockReview = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    aggregate: vi.fn(),
  };

  return {
    PrismaClient: class {
      review = mockReview;
    },
  };
});

const prisma = new PrismaClient();
const prismaMock = {
  review: prisma.review as unknown as {
    create: Mock;
    findMany: Mock;
    findUnique: Mock;
    findFirst: Mock;
    update: Mock;
    deleteMany: Mock;
    aggregate: Mock;
  },
};

describe("ReviewService", () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    vi.clearAllMocks();
    reviewService = new ReviewService();
  });

  describe("createReview", () => {
    it("deve criar uma nova review com sucesso", async () => {
      const reviewData = {
        userId: "user-123",
        gameId: "game-456",
        rating: 9,
        comment: "Excelente jogo!",
      };

      const mockPrismaReview = {
        id: "review-1",
        userId: reviewData.userId,
        gameId: reviewData.gameId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date(),
        updatedAt: null,
      };

      prismaMock.review.create.mockResolvedValue(mockPrismaReview);

      const review: Review = await reviewService.createReview(
        reviewData.userId,
        reviewData.gameId,
        reviewData.rating,
        reviewData.comment
      );

      expect(prismaMock.review.create).toHaveBeenCalledWith({
        data: {
          userId: reviewData.userId,
          gameId: reviewData.gameId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });
      expect(review.rating).toBe(reviewData.rating);
      expect(review.comment).toBe(reviewData.comment);
      expect(review.updatedAt).toBeUndefined();
    });

    it("deve lançar erro ao falhar na criação", async () => {
      prismaMock.review.create.mockRejectedValue(new Error("Database error"));

      await expect(
        reviewService.createReview("user-123", "game-456", 8, "Bom jogo")
      ).rejects.toThrow("Falha ao criar review");
    });
  });

  describe("getReviewsByGameId", () => {
    it("deve retornar reviews de um jogo específico", async () => {
      const gameId = "game-456";
      const mockReviews = [
        {
          id: "review-1",
          userId: "user-123",
          gameId,
          rating: 9,
          comment: "Muito bom!",
          createdAt: new Date(),
          updatedAt: null,
          user: {
            id: "user-123",
            name: "João",
            email: "joao@example.com",
          },
        },
        {
          id: "review-2",
          userId: "user-456",
          gameId,
          rating: 7,
          comment: "Legal",
          createdAt: new Date(),
          updatedAt: null,
          user: {
            id: "user-456",
            name: "Maria",
            email: "maria@example.com",
          },
        },
      ];

      prismaMock.review.findMany.mockResolvedValue(mockReviews);

      const reviews = await reviewService.getReviewsByGameId(gameId);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        where: { gameId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      expect(reviews).toHaveLength(2);
      expect(reviews[0].rating).toBe(9);
      expect(reviews[1].rating).toBe(7);
    });

    it("deve lançar erro ao falhar na busca", async () => {
      prismaMock.review.findMany.mockRejectedValue(new Error("Database error"));

      await expect(
        reviewService.getReviewsByGameId("game-456")
      ).rejects.toThrow("Falha ao buscar reviews do jogo");
    });
  });

  describe("getReviewsByUserId", () => {
    it("deve retornar reviews de um usuário específico", async () => {
      const userId = "user-123";
      const mockReviews = [
        {
          id: "review-1",
          userId,
          gameId: "game-456",
          rating: 9,
          comment: "Excelente!",
          createdAt: new Date(),
          updatedAt: null,
          game: {
            id: "game-456",
            gameId: "12345",
            isLiked: true,
          },
        },
      ];

      prismaMock.review.findMany.mockResolvedValue(mockReviews);

      const reviews = await reviewService.getReviewsByUserId(userId);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          game: true,
        },
      });
      expect(reviews).toHaveLength(1);
      expect(reviews[0].userId).toBe(userId);
    });

    it("deve lançar erro ao falhar na busca", async () => {
      prismaMock.review.findMany.mockRejectedValue(new Error("Database error"));

      await expect(
        reviewService.getReviewsByUserId("user-123")
      ).rejects.toThrow("Falha ao buscar reviews do usuário");
    });
  });

  describe("getReviewById", () => {
    it("deve retornar uma review específica", async () => {
      const reviewId = "review-1";
      const mockReview = {
        id: reviewId,
        userId: "user-123",
        gameId: "game-456",
        rating: 8,
        comment: "Muito bom!",
        createdAt: new Date(),
        updatedAt: null,
        user: {
          id: "user-123",
          name: "João",
          email: "joao@example.com",
        },
        game: {
          id: "game-456",
          gameId: "12345",
          isLiked: false,
        },
      };

      prismaMock.review.findUnique.mockResolvedValue(mockReview);

      const review = await reviewService.getReviewById(reviewId);

      expect(prismaMock.review.findUnique).toHaveBeenCalledWith({
        where: { id: reviewId },
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
      expect(review).toBeDefined();
      expect(review?.id).toBe(reviewId);
      expect(review?.rating).toBe(8);
    });

    it("deve retornar null quando review não encontrado", async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      const review = await reviewService.getReviewById("nonexistent-id");

      expect(review).toBeNull();
    });

    it("deve lançar erro ao falhar na busca", async () => {
      prismaMock.review.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      await expect(reviewService.getReviewById("review-1")).rejects.toThrow(
        "Falha ao buscar review por ID"
      );
    });
  });

  describe("updateReview", () => {
    it("deve atualizar uma review com sucesso", async () => {
      const reviewId = "review-1";
      const userId = "user-123";
      const updateData = {
        rating: 10,
        comment: "Mudei de ideia, é perfeito!",
      };

      const mockExistingReview = {
        id: reviewId,
        userId,
        gameId: "game-456",
        rating: 8,
        comment: "Muito bom!",
        createdAt: new Date(),
        updatedAt: null,
      };

      const mockUpdatedReview = {
        ...mockExistingReview,
        rating: updateData.rating,
        comment: updateData.comment,
        updatedAt: new Date(),
      };

      prismaMock.review.findFirst.mockResolvedValue(mockExistingReview);
      prismaMock.review.update.mockResolvedValue(mockUpdatedReview);

      const review = await reviewService.updateReview(
        reviewId,
        userId,
        updateData
      );

      expect(prismaMock.review.findFirst).toHaveBeenCalledWith({
        where: {
          id: reviewId,
          userId,
        },
      });
      expect(prismaMock.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
        data: updateData,
      });
      expect(review.rating).toBe(10);
      expect(review.comment).toBe("Mudei de ideia, é perfeito!");
    });

    it("deve lançar erro quando review não existe", async () => {
      prismaMock.review.findFirst.mockResolvedValue(null);

      await expect(
        reviewService.updateReview("review-1", "user-123", { rating: 10 })
      ).rejects.toThrow("Review não encontrado ou sem permissão");
    });

    it("deve lançar erro ao falhar na atualização", async () => {
      const mockExistingReview = {
        id: "review-1",
        userId: "user-123",
        gameId: "game-456",
        rating: 8,
        comment: "Bom",
        createdAt: new Date(),
        updatedAt: null,
      };

      prismaMock.review.findFirst.mockResolvedValue(mockExistingReview);
      prismaMock.review.update.mockRejectedValue(new Error("Database error"));

      await expect(
        reviewService.updateReview("review-1", "user-123", { rating: 9 })
      ).rejects.toThrow("Falha ao atualizar review");
    });
  });

  describe("deleteReview", () => {
    it("deve deletar uma review com sucesso", async () => {
      const reviewId = "review-1";
      const userId = "user-123";

      prismaMock.review.deleteMany.mockResolvedValue({ count: 1 });

      await reviewService.deleteReview(reviewId, userId);

      expect(prismaMock.review.deleteMany).toHaveBeenCalledWith({
        where: {
          id: reviewId,
          userId,
        },
      });
    });

    it("deve lançar erro ao falhar na exclusão", async () => {
      prismaMock.review.deleteMany.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        reviewService.deleteReview("review-1", "user-123")
      ).rejects.toThrow("Falha ao deletar review");
    });
  });

  describe("getAverageRating", () => {
    it("deve calcular a média de rating de um jogo", async () => {
      const gameId = "game-456";

      prismaMock.review.aggregate.mockResolvedValue({
        _avg: {
          rating: 8.5,
        },
      });

      const averageRating = await reviewService.getAverageRating(gameId);

      expect(prismaMock.review.aggregate).toHaveBeenCalledWith({
        where: { gameId },
        _avg: {
          rating: true,
        },
      });
      expect(averageRating).toBe(8.5);
    });

    it("deve retornar null quando não houver reviews", async () => {
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: {
          rating: null,
        },
      });

      const averageRating = await reviewService.getAverageRating("game-456");

      expect(averageRating).toBeNull();
    });

    it("deve lançar erro ao falhar no cálculo", async () => {
      prismaMock.review.aggregate.mockRejectedValue(
        new Error("Database error")
      );

      await expect(reviewService.getAverageRating("game-456")).rejects.toThrow(
        "Falha ao calcular média de rating"
      );
    });
  });
});
