"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_1 = require("@prisma/client");
const review_service_1 = require("../../services/review.service");
vitest_1.vi.mock("@prisma/client", () => {
    const mockReview = {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findUnique: vitest_1.vi.fn(),
        findFirst: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        deleteMany: vitest_1.vi.fn(),
        aggregate: vitest_1.vi.fn(),
    };
    return {
        PrismaClient: class {
            review = mockReview;
        },
    };
});
const prisma = new client_1.PrismaClient();
const prismaMock = {
    review: prisma.review,
};
(0, vitest_1.describe)("ReviewService", () => {
    let reviewService;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        reviewService = new review_service_1.ReviewService();
    });
    (0, vitest_1.describe)("createReview", () => {
        (0, vitest_1.it)("deve criar uma nova review com sucesso", async () => {
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
            const review = await reviewService.createReview(reviewData.userId, reviewData.gameId, reviewData.rating, reviewData.comment);
            (0, vitest_1.expect)(prismaMock.review.create).toHaveBeenCalledWith({
                data: {
                    userId: reviewData.userId,
                    gameId: reviewData.gameId,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                },
            });
            (0, vitest_1.expect)(review.rating).toBe(reviewData.rating);
            (0, vitest_1.expect)(review.comment).toBe(reviewData.comment);
            (0, vitest_1.expect)(review.updatedAt).toBeUndefined();
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na criação", async () => {
            prismaMock.review.create.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(reviewService.createReview("user-123", "game-456", 8, "Bom jogo")).rejects.toThrow("Falha ao criar review");
        });
    });
    (0, vitest_1.describe)("getReviewsByGameId", () => {
        (0, vitest_1.it)("deve retornar reviews de um jogo específico", async () => {
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
            (0, vitest_1.expect)(prismaMock.review.findMany).toHaveBeenCalledWith({
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
            (0, vitest_1.expect)(reviews).toHaveLength(2);
            (0, vitest_1.expect)(reviews[0].rating).toBe(9);
            (0, vitest_1.expect)(reviews[1].rating).toBe(7);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na busca", async () => {
            prismaMock.review.findMany.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(reviewService.getReviewsByGameId("game-456")).rejects.toThrow("Falha ao buscar reviews do jogo");
        });
    });
    (0, vitest_1.describe)("getReviewsByUserId", () => {
        (0, vitest_1.it)("deve retornar reviews de um usuário específico", async () => {
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
            (0, vitest_1.expect)(prismaMock.review.findMany).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    game: true,
                },
            });
            (0, vitest_1.expect)(reviews).toHaveLength(1);
            (0, vitest_1.expect)(reviews[0].userId).toBe(userId);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na busca", async () => {
            prismaMock.review.findMany.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(reviewService.getReviewsByUserId("user-123")).rejects.toThrow("Falha ao buscar reviews do usuário");
        });
    });
    (0, vitest_1.describe)("getReviewById", () => {
        (0, vitest_1.it)("deve retornar uma review específica", async () => {
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
            (0, vitest_1.expect)(prismaMock.review.findUnique).toHaveBeenCalledWith({
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
            (0, vitest_1.expect)(review).toBeDefined();
            (0, vitest_1.expect)(review?.id).toBe(reviewId);
            (0, vitest_1.expect)(review?.rating).toBe(8);
        });
        (0, vitest_1.it)("deve retornar null quando review não encontrado", async () => {
            prismaMock.review.findUnique.mockResolvedValue(null);
            const review = await reviewService.getReviewById("nonexistent-id");
            (0, vitest_1.expect)(review).toBeNull();
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na busca", async () => {
            prismaMock.review.findUnique.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(reviewService.getReviewById("review-1")).rejects.toThrow("Falha ao buscar review por ID");
        });
    });
    (0, vitest_1.describe)("updateReview", () => {
        (0, vitest_1.it)("deve atualizar uma review com sucesso", async () => {
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
            const review = await reviewService.updateReview(reviewId, userId, updateData);
            (0, vitest_1.expect)(prismaMock.review.findFirst).toHaveBeenCalledWith({
                where: {
                    id: reviewId,
                    userId,
                },
            });
            (0, vitest_1.expect)(prismaMock.review.update).toHaveBeenCalledWith({
                where: { id: reviewId },
                data: updateData,
            });
            (0, vitest_1.expect)(review.rating).toBe(10);
            (0, vitest_1.expect)(review.comment).toBe("Mudei de ideia, é perfeito!");
        });
        (0, vitest_1.it)("deve lançar erro quando review não existe", async () => {
            prismaMock.review.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(reviewService.updateReview("review-1", "user-123", { rating: 10 })).rejects.toThrow("Review não encontrado ou sem permissão");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na atualização", async () => {
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
            await (0, vitest_1.expect)(reviewService.updateReview("review-1", "user-123", { rating: 9 })).rejects.toThrow("Falha ao atualizar review");
        });
    });
    (0, vitest_1.describe)("deleteReview", () => {
        (0, vitest_1.it)("deve deletar uma review com sucesso", async () => {
            const reviewId = "review-1";
            const userId = "user-123";
            prismaMock.review.deleteMany.mockResolvedValue({ count: 1 });
            await reviewService.deleteReview(reviewId, userId);
            (0, vitest_1.expect)(prismaMock.review.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: reviewId,
                    userId,
                },
            });
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na exclusão", async () => {
            prismaMock.review.deleteMany.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(reviewService.deleteReview("review-1", "user-123")).rejects.toThrow("Falha ao deletar review");
        });
    });
    (0, vitest_1.describe)("getAverageRating", () => {
        (0, vitest_1.it)("deve calcular a média de rating de um jogo", async () => {
            const gameId = "game-456";
            prismaMock.review.aggregate.mockResolvedValue({
                _avg: {
                    rating: 8.5,
                },
            });
            const averageRating = await reviewService.getAverageRating(gameId);
            (0, vitest_1.expect)(prismaMock.review.aggregate).toHaveBeenCalledWith({
                where: { gameId },
                _avg: {
                    rating: true,
                },
            });
            (0, vitest_1.expect)(averageRating).toBe(8.5);
        });
        (0, vitest_1.it)("deve retornar null quando não houver reviews", async () => {
            prismaMock.review.aggregate.mockResolvedValue({
                _avg: {
                    rating: null,
                },
            });
            const averageRating = await reviewService.getAverageRating("game-456");
            (0, vitest_1.expect)(averageRating).toBeNull();
        });
        (0, vitest_1.it)("deve lançar erro ao falhar no cálculo", async () => {
            prismaMock.review.aggregate.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(reviewService.getAverageRating("game-456")).rejects.toThrow("Falha ao calcular média de rating");
        });
    });
});
