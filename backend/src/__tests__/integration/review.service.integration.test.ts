import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ReviewService } from "../../services/review.service";
import { UserService } from "../../services/user.service";
import { Review } from "../../models/review.model";
import prisma from "../../lib/prisma";

describe("ReviewService - Testes de Integração", () => {
  let reviewService: ReviewService;
  let userService: UserService;
  let testUserId: string;
  let testGameId: string;
  const testReviewIds: string[] = [];
  const createdUserIds: string[] = [];
  const createdGameIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();

    userService = new UserService();
    const user = await userService.createUser(
      `review-test-${Date.now()}@example.com`,
      "Review Test User",
      "password123",
    );
    testUserId = user.id;
    createdUserIds.push(user.id);

    // Criar um jogo de teste
    const game = await prisma.game.create({
      data: {
        gameId: `test-game-${Date.now()}`,
      },
    });
    testGameId = game.id;
    createdGameIds.push(game.id);
  });

  afterAll(async () => {
    if (testReviewIds.length > 0) {
      await prisma.review.deleteMany({
        where: { id: { in: testReviewIds } },
      });
    }

    if (createdGameIds.length > 0) {
      await prisma.game.deleteMany({
        where: { id: { in: createdGameIds } },
      });
    }

    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }

    await prisma.$disconnect();
  });

  beforeEach(() => {
    reviewService = new ReviewService();
  });

  describe("createReview", () => {
    it("deve criar uma nova review no banco de dados", async () => {
      const reviewData = {
        userId: testUserId,
        gameId: testGameId,
        rating: 9,
        comment: "Excelente jogo! Muito divertido.",
      };

      const review: Review = await reviewService.createReview(
        reviewData.userId,
        reviewData.gameId,
        reviewData.rating,
        reviewData.comment,
      );

      testReviewIds.push(review.id);

      expect(review).toBeDefined();
      expect(review.id).toBeDefined();
      expect(review.userId).toBe(reviewData.userId);
      expect(review.gameId).toBe(reviewData.gameId);
      expect(review.rating).toBe(reviewData.rating);
      expect(review.comment).toBe(reviewData.comment);
      expect(review.createdAt).toBeInstanceOf(Date);
      if (review.updatedAt !== undefined) {
        expect(review.updatedAt).toBeInstanceOf(Date);
      }

      const dbReview = await prisma.review.findUnique({
        where: { id: review.id },
      });

      expect(dbReview).toBeDefined();
      expect(dbReview?.rating).toBe(reviewData.rating);
    });

    it("deve criar review com rating mínimo (0)", async () => {
      const review: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        0,
        "Não gostei.",
      );

      testReviewIds.push(review.id);

      expect(review.rating).toBe(0);
    });

    it("deve criar review com rating máximo (10)", async () => {
      const review: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        10,
        "Perfeito!",
      );

      testReviewIds.push(review.id);

      expect(review.rating).toBe(10);
    });
  });

  describe("getReviewsByGameId", () => {
    it("deve retornar todas as reviews de um jogo", async () => {
      const user2 = await userService.createUser(
        `review-user2-${Date.now()}@example.com`,
        "User 2",
        "password123",
      );
      createdUserIds.push(user2.id);

      const review1: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        8,
        "Muito bom!",
      );
      const review2: Review = await reviewService.createReview(
        user2.id,
        testGameId,
        7,
        "Legal",
      );

      testReviewIds.push(review1.id, review2.id);

      const reviews = await reviewService.getReviewsByGameId(testGameId);

      expect(reviews).toBeDefined();
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThanOrEqual(2);

      const reviewIds = reviews.map((r) => r.id);
      expect(reviewIds).toContain(review1.id);
      expect(reviewIds).toContain(review2.id);

      // Verificar se inclui dados do usuário
      const review1FromList = reviews.find((r) => r.id === review1.id);
      expect(review1FromList).toHaveProperty("user");
    });

    it("deve retornar array vazio quando jogo não tem reviews", async () => {
      const newGame = await prisma.game.create({
        data: {
          gameId: `no-reviews-${Date.now()}`,
        },
      });
      createdGameIds.push(newGame.id);

      const reviews = await reviewService.getReviewsByGameId(newGame.id);

      expect(reviews).toBeDefined();
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews).toHaveLength(0);
    });
  });

  describe("getReviewsByUserId", () => {
    it("deve retornar todas as reviews de um usuário", async () => {
      const game2 = await prisma.game.create({
        data: {
          gameId: `user-reviews-game-${Date.now()}`,
        },
      });
      createdGameIds.push(game2.id);

      const review1: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        9,
        "Ótimo!",
      );
      const review2: Review = await reviewService.createReview(
        testUserId,
        game2.id,
        6,
        "Razoável",
      );

      testReviewIds.push(review1.id, review2.id);

      const reviews = await reviewService.getReviewsByUserId(testUserId);

      expect(reviews).toBeDefined();
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThanOrEqual(2);

      const reviewIds = reviews.map((r) => r.id);
      expect(reviewIds).toContain(review1.id);
      expect(reviewIds).toContain(review2.id);

      // Verificar se inclui dados do jogo
      const review1FromList = reviews.find((r) => r.id === review1.id);
      expect(review1FromList).toHaveProperty("game");
    });

    it("deve retornar array vazio quando usuário não tem reviews", async () => {
      const newUser = await userService.createUser(
        `no-reviews-${Date.now()}@example.com`,
        "No Reviews User",
        "password123",
      );
      createdUserIds.push(newUser.id);

      const reviews = await reviewService.getReviewsByUserId(newUser.id);

      expect(reviews).toBeDefined();
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews).toHaveLength(0);
    });
  });

  describe("getReviewById", () => {
    it("deve retornar review específico por ID", async () => {
      const createdReview: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        8,
        "Muito bom mesmo!",
      );
      testReviewIds.push(createdReview.id);

      const review: Review | null = await reviewService.getReviewById(
        createdReview.id,
      );

      expect(review).toBeDefined();
      expect(review?.id).toBe(createdReview.id);
      expect(review?.rating).toBe(8);
      expect(review?.comment).toBe("Muito bom mesmo!");
      expect(review).toHaveProperty("user");
      expect(review).toHaveProperty("game");
    });

    it("deve retornar null para review inexistente", async () => {
      const review: Review | null =
        await reviewService.getReviewById("non-existent-id");

      expect(review).toBeNull();
    });
  });

  describe("updateReview", () => {
    it("deve atualizar rating de uma review", async () => {
      const review: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        7,
        "Bom jogo",
      );
      testReviewIds.push(review.id);

      const updatedReview: Review = await reviewService.updateReview(
        review.id,
        testUserId,
        { rating: 9 },
      );

      expect(updatedReview).toBeDefined();
      expect(updatedReview.id).toBe(review.id);
      expect(updatedReview.rating).toBe(9);
      expect(updatedReview.comment).toBe("Bom jogo");
      expect(updatedReview.updatedAt).toBeInstanceOf(Date);

      const dbReview = await prisma.review.findUnique({
        where: { id: review.id },
      });
      expect(dbReview?.rating).toBe(9);
    });

    it("deve atualizar comment de uma review", async () => {
      const review: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        8,
        "Comentário original",
      );
      testReviewIds.push(review.id);

      const updatedReview: Review = await reviewService.updateReview(
        review.id,
        testUserId,
        { comment: "Comentário atualizado!" },
      );

      expect(updatedReview.rating).toBe(8);
      expect(updatedReview.comment).toBe("Comentário atualizado!");
    });

    it("deve atualizar rating e comment simultaneamente", async () => {
      const review: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        5,
        "Mediano",
      );
      testReviewIds.push(review.id);

      const updatedReview: Review = await reviewService.updateReview(
        review.id,
        testUserId,
        {
          rating: 10,
          comment: "Mudei de ideia, é perfeito!",
        },
      );

      expect(updatedReview.rating).toBe(10);
      expect(updatedReview.comment).toBe("Mudei de ideia, é perfeito!");
    });

    it("deve lançar erro ao atualizar review de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `update-other-${Date.now()}@example.com`,
        "Other User",
        "password123",
      );
      createdUserIds.push(otherUser.id);

      const otherReview: Review = await reviewService.createReview(
        otherUser.id,
        testGameId,
        7,
        "Review de outro usuário",
      );
      testReviewIds.push(otherReview.id);

      await expect(
        reviewService.updateReview(otherReview.id, testUserId, { rating: 10 }),
      ).rejects.toThrow();
    });
  });

  describe("deleteReview", () => {
    it("deve deletar uma review existente", async () => {
      const review: Review = await reviewService.createReview(
        testUserId,
        testGameId,
        6,
        "Review para deletar",
      );
      testReviewIds.push(review.id);

      await reviewService.deleteReview(review.id, testUserId);

      const deletedReview = await prisma.review.findUnique({
        where: { id: review.id },
      });

      expect(deletedReview).toBeNull();
    });

    it("não deve deletar review de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `delete-other-${Date.now()}@example.com`,
        "Other User",
        "password123",
      );
      createdUserIds.push(otherUser.id);

      const otherReview: Review = await reviewService.createReview(
        otherUser.id,
        testGameId,
        8,
        "Review de outro",
      );
      testReviewIds.push(otherReview.id);

      // Tentar deletar com outro usuário não deve dar erro, mas não deve deletar
      await reviewService.deleteReview(otherReview.id, testUserId);

      const stillExists = await prisma.review.findUnique({
        where: { id: otherReview.id },
      });

      expect(stillExists).toBeDefined();
    });
  });

  describe("getAverageRating", () => {
    it("deve calcular média de rating corretamente", async () => {
      const game = await prisma.game.create({
        data: {
          gameId: `average-test-${Date.now()}`,
        },
      });
      createdGameIds.push(game.id);

      const user2 = await userService.createUser(
        `avg-user2-${Date.now()}@example.com`,
        "Avg User 2",
        "password123",
      );
      const user3 = await userService.createUser(
        `avg-user3-${Date.now()}@example.com`,
        "Avg User 3",
        "password123",
      );
      createdUserIds.push(user2.id, user3.id);

      const review1 = await reviewService.createReview(
        testUserId,
        game.id,
        10,
        "Perfeito",
      );
      const review2 = await reviewService.createReview(
        user2.id,
        game.id,
        8,
        "Muito bom",
      );
      const review3 = await reviewService.createReview(
        user3.id,
        game.id,
        6,
        "Bom",
      );

      testReviewIds.push(review1.id, review2.id, review3.id);

      const averageRating = await reviewService.getAverageRating(game.id);

      expect(averageRating).toBeDefined();
      expect(averageRating).toBe(8); // (10 + 8 + 6) / 3 = 8
    });

    it("deve retornar null quando jogo não tem reviews", async () => {
      const newGame = await prisma.game.create({
        data: {
          gameId: `no-avg-${Date.now()}`,
        },
      });
      createdGameIds.push(newGame.id);

      const averageRating = await reviewService.getAverageRating(newGame.id);

      expect(averageRating).toBeNull();
    });

    it("deve calcular média correta com uma única review", async () => {
      const game = await prisma.game.create({
        data: {
          gameId: `single-review-${Date.now()}`,
        },
      });
      createdGameIds.push(game.id);

      const review = await reviewService.createReview(
        testUserId,
        game.id,
        7,
        "Único review",
      );
      testReviewIds.push(review.id);

      const averageRating = await reviewService.getAverageRating(game.id);

      expect(averageRating).toBe(7);
    });
  });
});
