"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class ReviewService {
    async createReview(userId, gameId, rating, comment) {
        try {
            const createdReview = await prisma_1.default.review.create({
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
        }
        catch (error) {
            console.error("Erro ao criar review:", error);
            throw new Error("Falha ao criar review");
        }
    }
    async getReviewsByGameId(gameId) {
        try {
            const reviews = await prisma_1.default.review.findMany({
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
            return reviews.map((review) => ({
                ...review,
                updatedAt: review.updatedAt ?? undefined,
            }));
        }
        catch (error) {
            console.error("Erro ao buscar reviews do jogo:", error);
            throw new Error("Falha ao buscar reviews do jogo");
        }
    }
    async getReviewsByUserId(userId) {
        try {
            const reviews = await prisma_1.default.review.findMany({
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
        }
        catch (error) {
            console.error("Erro ao buscar reviews do usuário:", error);
            throw new Error("Falha ao buscar reviews do usuário");
        }
    }
    async getReviewById(id) {
        try {
            const review = await prisma_1.default.review.findUnique({
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
        }
        catch (error) {
            console.error("Erro ao buscar review por ID:", error);
            throw new Error("Falha ao buscar review por ID");
        }
    }
    async updateReview(id, userId, data) {
        try {
            const existingReview = await prisma_1.default.review.findFirst({
                where: {
                    id,
                    userId,
                },
            });
            if (!existingReview) {
                throw new Error("Review não encontrado ou sem permissão");
            }
            const updatedReview = await prisma_1.default.review.update({
                where: { id },
                data,
            });
            return {
                ...updatedReview,
                updatedAt: updatedReview.updatedAt ?? undefined,
            };
        }
        catch (error) {
            console.error("Erro ao atualizar review:", error);
            if (error instanceof Error &&
                error.message === "Review não encontrado ou sem permissão") {
                throw error;
            }
            throw new Error("Falha ao atualizar review");
        }
    }
    async deleteReview(id, userId) {
        try {
            await prisma_1.default.review.deleteMany({
                where: {
                    id,
                    userId,
                },
            });
        }
        catch (error) {
            console.error("Erro ao deletar review:", error);
            throw new Error("Falha ao deletar review");
        }
    }
    async getAverageRating(gameId) {
        try {
            const result = await prisma_1.default.review.aggregate({
                where: { gameId },
                _avg: {
                    rating: true,
                },
            });
            return result._avg.rating;
        }
        catch (error) {
            console.error("Erro ao calcular média de rating:", error);
            throw new Error("Falha ao calcular média de rating");
        }
    }
}
exports.ReviewService = ReviewService;
