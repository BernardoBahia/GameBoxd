"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const review_service_1 = require("../../services/review.service");
const user_service_1 = require("../../services/user.service");
const prisma_1 = __importDefault(require("../../lib/prisma"));
(0, vitest_1.describe)("ReviewService - Testes de Integração", () => {
    let reviewService;
    let userService;
    let testUserId;
    let testGameId;
    const testReviewIds = [];
    const createdUserIds = [];
    const createdGameIds = [];
    (0, vitest_1.beforeAll)(async () => {
        await prisma_1.default.$connect();
        userService = new user_service_1.UserService();
        const user = await userService.createUser(`review-test-${Date.now()}@example.com`, "Review Test User", "password123");
        testUserId = user.id;
        createdUserIds.push(user.id);
        // Criar um jogo de teste
        const game = await prisma_1.default.game.create({
            data: {
                gameId: `test-game-${Date.now()}`,
            },
        });
        testGameId = game.id;
        createdGameIds.push(game.id);
    });
    (0, vitest_1.afterAll)(async () => {
        if (testReviewIds.length > 0) {
            await prisma_1.default.review.deleteMany({
                where: { id: { in: testReviewIds } },
            });
        }
        if (createdGameIds.length > 0) {
            await prisma_1.default.game.deleteMany({
                where: { id: { in: createdGameIds } },
            });
        }
        if (createdUserIds.length > 0) {
            await prisma_1.default.user.deleteMany({
                where: { id: { in: createdUserIds } },
            });
        }
        await prisma_1.default.$disconnect();
    });
    (0, vitest_1.beforeEach)(() => {
        reviewService = new review_service_1.ReviewService();
    });
    (0, vitest_1.describe)("createReview", () => {
        (0, vitest_1.it)("deve criar uma nova review no banco de dados", async () => {
            const reviewData = {
                userId: testUserId,
                gameId: testGameId,
                rating: 9,
                comment: "Excelente jogo! Muito divertido.",
            };
            const review = await reviewService.createReview(reviewData.userId, reviewData.gameId, reviewData.rating, reviewData.comment);
            testReviewIds.push(review.id);
            (0, vitest_1.expect)(review).toBeDefined();
            (0, vitest_1.expect)(review.id).toBeDefined();
            (0, vitest_1.expect)(review.userId).toBe(reviewData.userId);
            (0, vitest_1.expect)(review.gameId).toBe(reviewData.gameId);
            (0, vitest_1.expect)(review.rating).toBe(reviewData.rating);
            (0, vitest_1.expect)(review.comment).toBe(reviewData.comment);
            (0, vitest_1.expect)(review.createdAt).toBeInstanceOf(Date);
            (0, vitest_1.expect)(review.updatedAt).toBeUndefined();
            const dbReview = await prisma_1.default.review.findUnique({
                where: { id: review.id },
            });
            (0, vitest_1.expect)(dbReview).toBeDefined();
            (0, vitest_1.expect)(dbReview?.rating).toBe(reviewData.rating);
        });
        (0, vitest_1.it)("deve criar review com rating mínimo (0)", async () => {
            const review = await reviewService.createReview(testUserId, testGameId, 0, "Não gostei.");
            testReviewIds.push(review.id);
            (0, vitest_1.expect)(review.rating).toBe(0);
        });
        (0, vitest_1.it)("deve criar review com rating máximo (10)", async () => {
            const review = await reviewService.createReview(testUserId, testGameId, 10, "Perfeito!");
            testReviewIds.push(review.id);
            (0, vitest_1.expect)(review.rating).toBe(10);
        });
    });
    (0, vitest_1.describe)("getReviewsByGameId", () => {
        (0, vitest_1.it)("deve retornar todas as reviews de um jogo", async () => {
            const user2 = await userService.createUser(`review-user2-${Date.now()}@example.com`, "User 2", "password123");
            createdUserIds.push(user2.id);
            const review1 = await reviewService.createReview(testUserId, testGameId, 8, "Muito bom!");
            const review2 = await reviewService.createReview(user2.id, testGameId, 7, "Legal");
            testReviewIds.push(review1.id, review2.id);
            const reviews = await reviewService.getReviewsByGameId(testGameId);
            (0, vitest_1.expect)(reviews).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(reviews)).toBe(true);
            (0, vitest_1.expect)(reviews.length).toBeGreaterThanOrEqual(2);
            const reviewIds = reviews.map((r) => r.id);
            (0, vitest_1.expect)(reviewIds).toContain(review1.id);
            (0, vitest_1.expect)(reviewIds).toContain(review2.id);
            // Verificar se inclui dados do usuário
            const review1FromList = reviews.find((r) => r.id === review1.id);
            (0, vitest_1.expect)(review1FromList).toHaveProperty("user");
        });
        (0, vitest_1.it)("deve retornar array vazio quando jogo não tem reviews", async () => {
            const newGame = await prisma_1.default.game.create({
                data: {
                    gameId: `no-reviews-${Date.now()}`,
                },
            });
            createdGameIds.push(newGame.id);
            const reviews = await reviewService.getReviewsByGameId(newGame.id);
            (0, vitest_1.expect)(reviews).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(reviews)).toBe(true);
            (0, vitest_1.expect)(reviews).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)("getReviewsByUserId", () => {
        (0, vitest_1.it)("deve retornar todas as reviews de um usuário", async () => {
            const game2 = await prisma_1.default.game.create({
                data: {
                    gameId: `user-reviews-game-${Date.now()}`,
                },
            });
            createdGameIds.push(game2.id);
            const review1 = await reviewService.createReview(testUserId, testGameId, 9, "Ótimo!");
            const review2 = await reviewService.createReview(testUserId, game2.id, 6, "Razoável");
            testReviewIds.push(review1.id, review2.id);
            const reviews = await reviewService.getReviewsByUserId(testUserId);
            (0, vitest_1.expect)(reviews).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(reviews)).toBe(true);
            (0, vitest_1.expect)(reviews.length).toBeGreaterThanOrEqual(2);
            const reviewIds = reviews.map((r) => r.id);
            (0, vitest_1.expect)(reviewIds).toContain(review1.id);
            (0, vitest_1.expect)(reviewIds).toContain(review2.id);
            // Verificar se inclui dados do jogo
            const review1FromList = reviews.find((r) => r.id === review1.id);
            (0, vitest_1.expect)(review1FromList).toHaveProperty("game");
        });
        (0, vitest_1.it)("deve retornar array vazio quando usuário não tem reviews", async () => {
            const newUser = await userService.createUser(`no-reviews-${Date.now()}@example.com`, "No Reviews User", "password123");
            createdUserIds.push(newUser.id);
            const reviews = await reviewService.getReviewsByUserId(newUser.id);
            (0, vitest_1.expect)(reviews).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(reviews)).toBe(true);
            (0, vitest_1.expect)(reviews).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)("getReviewById", () => {
        (0, vitest_1.it)("deve retornar review específico por ID", async () => {
            const createdReview = await reviewService.createReview(testUserId, testGameId, 8, "Muito bom mesmo!");
            testReviewIds.push(createdReview.id);
            const review = await reviewService.getReviewById(createdReview.id);
            (0, vitest_1.expect)(review).toBeDefined();
            (0, vitest_1.expect)(review?.id).toBe(createdReview.id);
            (0, vitest_1.expect)(review?.rating).toBe(8);
            (0, vitest_1.expect)(review?.comment).toBe("Muito bom mesmo!");
            (0, vitest_1.expect)(review).toHaveProperty("user");
            (0, vitest_1.expect)(review).toHaveProperty("game");
        });
        (0, vitest_1.it)("deve retornar null para review inexistente", async () => {
            const review = await reviewService.getReviewById("non-existent-id");
            (0, vitest_1.expect)(review).toBeNull();
        });
    });
    (0, vitest_1.describe)("updateReview", () => {
        (0, vitest_1.it)("deve atualizar rating de uma review", async () => {
            const review = await reviewService.createReview(testUserId, testGameId, 7, "Bom jogo");
            testReviewIds.push(review.id);
            const updatedReview = await reviewService.updateReview(review.id, testUserId, { rating: 9 });
            (0, vitest_1.expect)(updatedReview).toBeDefined();
            (0, vitest_1.expect)(updatedReview.id).toBe(review.id);
            (0, vitest_1.expect)(updatedReview.rating).toBe(9);
            (0, vitest_1.expect)(updatedReview.comment).toBe("Bom jogo");
            (0, vitest_1.expect)(updatedReview.updatedAt).toBeInstanceOf(Date);
            const dbReview = await prisma_1.default.review.findUnique({
                where: { id: review.id },
            });
            (0, vitest_1.expect)(dbReview?.rating).toBe(9);
        });
        (0, vitest_1.it)("deve atualizar comment de uma review", async () => {
            const review = await reviewService.createReview(testUserId, testGameId, 8, "Comentário original");
            testReviewIds.push(review.id);
            const updatedReview = await reviewService.updateReview(review.id, testUserId, { comment: "Comentário atualizado!" });
            (0, vitest_1.expect)(updatedReview.rating).toBe(8);
            (0, vitest_1.expect)(updatedReview.comment).toBe("Comentário atualizado!");
        });
        (0, vitest_1.it)("deve atualizar rating e comment simultaneamente", async () => {
            const review = await reviewService.createReview(testUserId, testGameId, 5, "Mediano");
            testReviewIds.push(review.id);
            const updatedReview = await reviewService.updateReview(review.id, testUserId, {
                rating: 10,
                comment: "Mudei de ideia, é perfeito!",
            });
            (0, vitest_1.expect)(updatedReview.rating).toBe(10);
            (0, vitest_1.expect)(updatedReview.comment).toBe("Mudei de ideia, é perfeito!");
        });
        (0, vitest_1.it)("deve lançar erro ao atualizar review de outro usuário", async () => {
            const otherUser = await userService.createUser(`update-other-${Date.now()}@example.com`, "Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherReview = await reviewService.createReview(otherUser.id, testGameId, 7, "Review de outro usuário");
            testReviewIds.push(otherReview.id);
            await (0, vitest_1.expect)(reviewService.updateReview(otherReview.id, testUserId, { rating: 10 })).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("deleteReview", () => {
        (0, vitest_1.it)("deve deletar uma review existente", async () => {
            const review = await reviewService.createReview(testUserId, testGameId, 6, "Review para deletar");
            testReviewIds.push(review.id);
            await reviewService.deleteReview(review.id, testUserId);
            const deletedReview = await prisma_1.default.review.findUnique({
                where: { id: review.id },
            });
            (0, vitest_1.expect)(deletedReview).toBeNull();
        });
        (0, vitest_1.it)("não deve deletar review de outro usuário", async () => {
            const otherUser = await userService.createUser(`delete-other-${Date.now()}@example.com`, "Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherReview = await reviewService.createReview(otherUser.id, testGameId, 8, "Review de outro");
            testReviewIds.push(otherReview.id);
            // Tentar deletar com outro usuário não deve dar erro, mas não deve deletar
            await reviewService.deleteReview(otherReview.id, testUserId);
            const stillExists = await prisma_1.default.review.findUnique({
                where: { id: otherReview.id },
            });
            (0, vitest_1.expect)(stillExists).toBeDefined();
        });
    });
    (0, vitest_1.describe)("getAverageRating", () => {
        (0, vitest_1.it)("deve calcular média de rating corretamente", async () => {
            const game = await prisma_1.default.game.create({
                data: {
                    gameId: `average-test-${Date.now()}`,
                },
            });
            createdGameIds.push(game.id);
            const user2 = await userService.createUser(`avg-user2-${Date.now()}@example.com`, "Avg User 2", "password123");
            const user3 = await userService.createUser(`avg-user3-${Date.now()}@example.com`, "Avg User 3", "password123");
            createdUserIds.push(user2.id, user3.id);
            const review1 = await reviewService.createReview(testUserId, game.id, 10, "Perfeito");
            const review2 = await reviewService.createReview(user2.id, game.id, 8, "Muito bom");
            const review3 = await reviewService.createReview(user3.id, game.id, 6, "Bom");
            testReviewIds.push(review1.id, review2.id, review3.id);
            const averageRating = await reviewService.getAverageRating(game.id);
            (0, vitest_1.expect)(averageRating).toBeDefined();
            (0, vitest_1.expect)(averageRating).toBe(8); // (10 + 8 + 6) / 3 = 8
        });
        (0, vitest_1.it)("deve retornar null quando jogo não tem reviews", async () => {
            const newGame = await prisma_1.default.game.create({
                data: {
                    gameId: `no-avg-${Date.now()}`,
                },
            });
            createdGameIds.push(newGame.id);
            const averageRating = await reviewService.getAverageRating(newGame.id);
            (0, vitest_1.expect)(averageRating).toBeNull();
        });
        (0, vitest_1.it)("deve calcular média correta com uma única review", async () => {
            const game = await prisma_1.default.game.create({
                data: {
                    gameId: `single-review-${Date.now()}`,
                },
            });
            createdGameIds.push(game.id);
            const review = await reviewService.createReview(testUserId, game.id, 7, "Único review");
            testReviewIds.push(review.id);
            const averageRating = await reviewService.getAverageRating(game.id);
            (0, vitest_1.expect)(averageRating).toBe(7);
        });
    });
});
