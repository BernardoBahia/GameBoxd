"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListService = void 0;
const game_service_1 = require("./game.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const gameService = new game_service_1.GameService();
class ListService {
    async enrichListWithGameDetails(list) {
        if (list.listGames && list.listGames.length > 0) {
            const enrichedListGames = await Promise.all(list.listGames.map(async (listGame) => {
                try {
                    const gameDetails = await gameService.getGameDetails(parseInt(listGame.game.gameId));
                    return {
                        ...listGame,
                        game: {
                            ...listGame.game,
                            name: gameDetails.name,
                            background_image: gameDetails.background_image,
                            released: gameDetails.released,
                            metacritic: gameDetails.metacritic,
                            gameboxdRating: gameDetails.gameboxdRating,
                            gameboxdRatingCount: gameDetails.gameboxdRatingCount,
                            genres: gameDetails.genres,
                        },
                    };
                }
                catch (error) {
                    console.error(`Erro ao buscar detalhes do jogo ${listGame.game.gameId}:`, error);
                    return listGame;
                }
            }));
            return { ...list, listGames: enrichedListGames };
        }
        return list;
    }
    async createList(name, userId) {
        try {
            const createdList = await prisma_1.default.list.create({
                data: {
                    name,
                    userId,
                },
            });
            return createdList;
        }
        catch (error) {
            console.error("Erro ao criar lista:", error);
            throw new Error("Falha ao criar lista");
        }
    }
    async getListsByUserId(userId) {
        try {
            const lists = await prisma_1.default.list.findMany({
                where: { userId },
                include: {
                    listGames: {
                        include: {
                            game: true,
                        },
                    },
                },
            });
            const enrichedLists = await Promise.all(lists.map((list) => this.enrichListWithGameDetails(list)));
            return enrichedLists;
        }
        catch (error) {
            console.error("Erro ao buscar listas do usuário:", error);
            throw new Error("Falha ao buscar listas do usuário");
        }
    }
    async deleteList(listId, userId) {
        try {
            const result = await prisma_1.default.list.deleteMany({
                where: {
                    id: listId,
                    userId,
                },
            });
            if (result.count === 0) {
                throw new Error("Lista não encontrada ou sem permissão para deletar");
            }
        }
        catch (error) {
            console.error("Erro ao deletar lista:", error);
            if (error instanceof Error &&
                error.message === "Lista não encontrada ou sem permissão para deletar") {
                throw error;
            }
            throw new Error("Falha ao deletar lista");
        }
    }
    async renameList(listId, userId, newName) {
        try {
            const existingList = await prisma_1.default.list.findFirst({
                where: {
                    id: listId,
                    userId,
                },
            });
            if (!existingList) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            const renamedList = await prisma_1.default.list.update({
                where: { id: listId },
                data: {
                    name: newName,
                },
            });
            return renamedList;
        }
        catch (error) {
            console.error("Erro ao renomear lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao renomear lista");
        }
    }
    async getListById(listId, userId) {
        try {
            const list = await prisma_1.default.list.findFirst({
                where: {
                    id: listId,
                    userId,
                },
                include: {
                    listGames: {
                        include: {
                            game: true,
                        },
                    },
                },
            });
            if (!list)
                return null;
            const enrichedList = await this.enrichListWithGameDetails(list);
            return enrichedList;
        }
        catch (error) {
            console.error("Erro ao buscar lista por ID:", error);
            throw new Error("Falha ao buscar lista por ID");
        }
    }
    async addGameToList(listId, userId, gameId) {
        try {
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            let game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (!game) {
                game = await prisma_1.default.game.create({
                    data: {
                        gameId,
                        isLiked: false,
                    },
                });
            }
            await prisma_1.default.listGame.create({
                data: {
                    listId,
                    gameId: game.id,
                },
            });
        }
        catch (error) {
            console.error("Erro ao adicionar jogo à lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao adicionar jogo à lista");
        }
    }
    async removeGameFromList(listId, userId, gameId) {
        try {
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            const game = await prisma_1.default.game.findFirst({
                where: {
                    OR: [{ id: gameId }, { gameId }],
                },
            });
            const resolvedGameId = game?.id ?? gameId;
            await prisma_1.default.listGame.deleteMany({
                where: {
                    listId,
                    gameId: resolvedGameId,
                },
            });
        }
        catch (error) {
            console.error("Erro ao remover jogo da lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao remover jogo da lista");
        }
    }
    async updateList(listId, userId, data) {
        try {
            const existingList = await prisma_1.default.list.findFirst({
                where: {
                    id: listId,
                    userId,
                },
            });
            if (!existingList) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            const updated = await prisma_1.default.list.update({
                where: { id: listId },
                data: {
                    ...(typeof data.name === "string" ? { name: data.name } : {}),
                    ...(typeof data.isPublic === "boolean"
                        ? { isPublic: data.isPublic }
                        : {}),
                },
            });
            return updated;
        }
        catch (error) {
            console.error("Erro ao atualizar lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao atualizar lista");
        }
    }
    async removeListGameItem(listId, userId, listGameId) {
        try {
            const list = await this.getListById(listId, userId);
            if (!list) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            const existing = await prisma_1.default.listGame.findFirst({
                where: {
                    id: listGameId,
                    listId,
                },
            });
            if (!existing) {
                throw new Error("Item da lista não encontrado");
            }
            await prisma_1.default.listGame.delete({
                where: { id: listGameId },
            });
        }
        catch (error) {
            console.error("Erro ao remover item da lista:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao remover item da lista");
        }
    }
    async makeListPublic(listId, userId) {
        try {
            const existingList = await prisma_1.default.list.findFirst({
                where: {
                    id: listId,
                    userId,
                },
            });
            if (!existingList) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            const updatedList = await prisma_1.default.list.update({
                where: { id: listId },
                data: {
                    isPublic: true,
                },
            });
            return updatedList;
        }
        catch (error) {
            console.error("Erro ao tornar lista pública:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao tornar lista pública");
        }
    }
    async makeListPrivate(listId, userId) {
        try {
            const existingList = await prisma_1.default.list.findFirst({
                where: {
                    id: listId,
                    userId,
                },
            });
            if (!existingList) {
                throw new Error("Lista não encontrada ou sem permissão para editar");
            }
            const updatedList = await prisma_1.default.list.update({
                where: { id: listId },
                data: {
                    isPublic: false,
                },
            });
            return updatedList;
        }
        catch (error) {
            console.error("Erro ao tornar lista privada:", error);
            if (error instanceof Error && error.message.includes("não encontrada")) {
                throw error;
            }
            throw new Error("Falha ao tornar lista privada");
        }
    }
}
exports.ListService = ListService;
