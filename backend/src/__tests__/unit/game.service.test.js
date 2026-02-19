"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_1 = require("@prisma/client");
let mockAxiosGet = vitest_1.vi.fn();
vitest_1.vi.mock("axios", () => ({
    default: {
        create: () => ({
            get: (...args) => mockAxiosGet(...args),
        }),
    },
}));
const game_service_1 = require("../../services/game.service");
vitest_1.vi.mock("@prisma/client", () => {
    const mockGame = {
        findUnique: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
    };
    const mockUserLikedGame = {
        findUnique: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    };
    const mockUserGameStatus = {
        findUnique: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        deleteMany: vitest_1.vi.fn(),
    };
    return {
        PrismaClient: class {
            game = mockGame;
            userLikedGame = mockUserLikedGame;
            userGameStatus = mockUserGameStatus;
        },
    };
});
const prisma = new client_1.PrismaClient();
const prismaMock = {
    game: prisma.game,
    userLikedGame: prisma.userLikedGame,
    userGameStatus: prisma.userGameStatus,
};
(0, vitest_1.describe)("GameService", () => {
    let gameService;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        gameService = new game_service_1.GameService();
    });
    // ==========================================================================
    // TESTES DE MÉTODOS DE API EXTERNA (RAWG)
    // ==========================================================================
    (0, vitest_1.describe)("getGames", () => {
        (0, vitest_1.it)("deve retornar lista de jogos da API", async () => {
            mockAxiosGet.mockResolvedValue({
                data: {
                    results: [
                        {
                            id: 1,
                            name: "Game 1",
                            released: "2020-01-01",
                            background_image: "image1.jpg",
                        },
                        {
                            id: 2,
                            name: "Game 2",
                            released: "2021-01-01",
                            background_image: "image2.jpg",
                        },
                    ],
                },
            });
            const games = await gameService.getGames(1, 10);
            (0, vitest_1.expect)(games).toHaveLength(2);
            (0, vitest_1.expect)(games[0].name).toBe("Game 1");
            (0, vitest_1.expect)(games[1].name).toBe("Game 2");
        });
        (0, vitest_1.it)("deve lançar erro quando API falhar", async () => {
            mockAxiosGet.mockRejectedValue(new Error("API Error"));
            await (0, vitest_1.expect)(gameService.getGames()).rejects.toThrow("Erro ao obter jogos");
        });
    });
    (0, vitest_1.describe)("searchGames", () => {
        (0, vitest_1.it)("deve buscar jogos por query com detalhes completos", async () => {
            mockAxiosGet
                .mockResolvedValueOnce({
                data: {
                    results: [{ id: 10, name: "Minecraft" }],
                },
            })
                .mockResolvedValueOnce({
                data: {
                    id: 10,
                    name: "Minecraft",
                    released: "2011-11-18",
                    background_image: "minecraft.jpg",
                    genres: [{ name: "Sandbox" }],
                    developers: [{ name: "Mojang" }],
                    publishers: [{ name: "Microsoft" }],
                    platforms: [{ platform: { name: "PC" } }],
                },
            })
                .mockResolvedValueOnce({
                data: {
                    results: [],
                },
            });
            const games = await gameService.searchGames("minecraft", 1, 10);
            (0, vitest_1.expect)(games).toHaveLength(1);
            (0, vitest_1.expect)(games[0].name).toBe("Minecraft");
            (0, vitest_1.expect)(games[0].genres).toContain("Sandbox");
            (0, vitest_1.expect)(games[0].developers).toContain("Mojang");
        });
        (0, vitest_1.it)("deve lançar erro quando busca falhar", async () => {
            mockAxiosGet.mockRejectedValue(new Error("API Error"));
            await (0, vitest_1.expect)(gameService.searchGames("test")).rejects.toThrow("Erro ao buscar jogos");
        });
    });
    (0, vitest_1.describe)("searchGamesByPlatform", () => {
        (0, vitest_1.it)("deve buscar jogos por plataforma", async () => {
            mockAxiosGet
                .mockResolvedValueOnce({
                data: {
                    results: [{ id: 30, name: "Halo" }],
                },
            })
                .mockResolvedValueOnce({
                data: {
                    id: 30,
                    name: "Halo",
                    released: "2021-12-08",
                    background_image: "halo.jpg",
                    genres: [{ name: "Shooter" }],
                    developers: [{ name: "343 Industries" }],
                    publishers: [{ name: "Xbox" }],
                    platforms: [{ platform: { name: "Xbox" } }],
                },
            })
                .mockResolvedValueOnce({
                data: { results: [] },
            });
            const games = await gameService.searchGamesByPlatform(186, 1, 10);
            (0, vitest_1.expect)(games).toHaveLength(1);
            (0, vitest_1.expect)(games[0].name).toBe("Halo");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            mockAxiosGet.mockRejectedValue(new Error("API Error"));
            await (0, vitest_1.expect)(gameService.searchGamesByPlatform(186)).rejects.toThrow("Erro ao buscar jogos por plataforma");
        });
    });
    (0, vitest_1.describe)("searchGamesByGenre", () => {
        (0, vitest_1.it)("deve buscar jogos por gênero", async () => {
            mockAxiosGet
                .mockResolvedValueOnce({
                data: {
                    results: [{ id: 40, name: "Dark Souls" }],
                },
            })
                .mockResolvedValueOnce({
                data: {
                    id: 40,
                    name: "Dark Souls",
                    released: "2011-09-22",
                    background_image: "darksouls.jpg",
                    genres: [{ name: "RPG" }],
                    developers: [{ name: "FromSoftware" }],
                    publishers: [{ name: "Bandai Namco" }],
                    platforms: [{ platform: { name: "PC" } }],
                },
            })
                .mockResolvedValueOnce({
                data: { results: [] },
            });
            const games = await gameService.searchGamesByGenre(5, 1, 10);
            (0, vitest_1.expect)(games).toHaveLength(1);
            (0, vitest_1.expect)(games[0].name).toBe("Dark Souls");
            (0, vitest_1.expect)(games[0].genres).toContain("RPG");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            mockAxiosGet.mockRejectedValue(new Error("API Error"));
            await (0, vitest_1.expect)(gameService.searchGamesByGenre(5)).rejects.toThrow("Erro ao buscar jogos por gênero");
        });
    });
    (0, vitest_1.describe)("searchGamesByDlc", () => {
        (0, vitest_1.it)("deve buscar jogos por DLC", async () => {
            mockAxiosGet
                .mockResolvedValueOnce({
                data: {
                    results: [{ id: 50, name: "Witcher DLC" }],
                },
            })
                .mockResolvedValueOnce({
                data: {
                    id: 50,
                    name: "Witcher DLC",
                    released: "2016-05-31",
                    background_image: "dlc.jpg",
                    genres: [{ name: "RPG" }],
                    developers: [{ name: "CD Projekt Red" }],
                    publishers: [{ name: "CD Projekt" }],
                    platforms: [{ platform: { name: "PC" } }],
                },
            })
                .mockResolvedValueOnce({
                data: { results: [] },
            });
            const games = await gameService.searchGamesByDlc(100, 1, 10);
            (0, vitest_1.expect)(games).toHaveLength(1);
            (0, vitest_1.expect)(games[0].name).toBe("Witcher DLC");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            mockAxiosGet.mockRejectedValue(new Error("API Error"));
            await (0, vitest_1.expect)(gameService.searchGamesByDlc(100)).rejects.toThrow("Erro ao buscar jogos por DLC");
        });
    });
    (0, vitest_1.describe)("getGameDetails", () => {
        (0, vitest_1.it)("deve retornar detalhes completos de um jogo", async () => {
            mockAxiosGet
                .mockResolvedValueOnce({
                data: {
                    id: 60,
                    name: "Elden Ring",
                    released: "2022-02-25",
                    background_image: "eldenring.jpg",
                    genres: [{ name: "Action RPG" }],
                    developers: [{ name: "FromSoftware" }],
                    publishers: [{ name: "Bandai Namco" }],
                    platforms: [{ platform: { name: "PC" } }],
                },
            })
                .mockResolvedValueOnce({
                data: {
                    results: [
                        {
                            id: 61,
                            name: "Shadow of the Erdtree",
                            released: "2024-06-21",
                        },
                    ],
                },
            });
            const game = await gameService.getGameDetails(60);
            (0, vitest_1.expect)(game.id).toBe(60);
            (0, vitest_1.expect)(game.name).toBe("Elden Ring");
            (0, vitest_1.expect)(game.genres).toContain("Action RPG");
            (0, vitest_1.expect)(game.dlcs).toHaveLength(1);
            (0, vitest_1.expect)(game.dlcs[0].name).toBe("Shadow of the Erdtree");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            mockAxiosGet.mockRejectedValue(new Error("API Error"));
            await (0, vitest_1.expect)(gameService.getGameDetails(999)).rejects.toThrow("Erro ao buscar detalhes do jogo");
        });
    });
    (0, vitest_1.describe)("likeGame", () => {
        (0, vitest_1.it)("deve curtir um jogo quando ainda não curtido", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            prismaMock.game.findUnique.mockResolvedValue(mockGame);
            prismaMock.userLikedGame.findUnique.mockResolvedValue(null);
            prismaMock.userLikedGame.create.mockResolvedValue({
                id: "like-uuid",
                userId: "user-123",
                gameId: mockGame.id,
            });
            const result = await gameService.likeGame("user-123", "123");
            (0, vitest_1.expect)(prismaMock.game.findUnique).toHaveBeenCalledWith({
                where: { gameId: "123" },
            });
            (0, vitest_1.expect)(prismaMock.userLikedGame.create).toHaveBeenCalledWith({
                data: {
                    userId: "user-123",
                    gameId: mockGame.id,
                },
            });
            (0, vitest_1.expect)(result.message).toBe("Jogo curtido com sucesso");
            (0, vitest_1.expect)(result.liked).toBe(true);
        });
        (0, vitest_1.it)("deve descurtir um jogo quando já curtido", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            const mockLike = {
                id: "like-uuid",
                userId: "user-123",
                gameId: mockGame.id,
            };
            prismaMock.game.findUnique.mockResolvedValue(mockGame);
            prismaMock.userLikedGame.findUnique.mockResolvedValue(mockLike);
            prismaMock.userLikedGame.delete.mockResolvedValue(mockLike);
            const result = await gameService.likeGame("user-123", "123");
            (0, vitest_1.expect)(prismaMock.userLikedGame.delete).toHaveBeenCalledWith({
                where: { id: mockLike.id },
            });
            (0, vitest_1.expect)(result.message).toBe("Curtida removida com sucesso");
            (0, vitest_1.expect)(result.liked).toBe(false);
        });
        (0, vitest_1.it)("deve criar jogo no banco se não existir", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            prismaMock.game.findUnique.mockResolvedValue(null);
            prismaMock.game.create.mockResolvedValue(mockGame);
            prismaMock.userLikedGame.findUnique.mockResolvedValue(null);
            prismaMock.userLikedGame.create.mockResolvedValue({
                id: "like-uuid",
                userId: "user-123",
                gameId: mockGame.id,
            });
            await gameService.likeGame("user-123", "123");
            (0, vitest_1.expect)(prismaMock.game.create).toHaveBeenCalledWith({
                data: { gameId: "123", isLiked: false },
            });
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));
            await (0, vitest_1.expect)(gameService.likeGame("user-123", "123")).rejects.toThrow("Erro ao curtir jogo");
        });
    });
    (0, vitest_1.describe)("getUserLikedGames", () => {
        (0, vitest_1.it)("deve retornar lista de jogos curtidos pelo usuário", async () => {
            const mockLikedGames = [
                {
                    id: "like-1",
                    userId: "user-123",
                    gameId: "game-1",
                    game: { gameId: "1" },
                },
                {
                    id: "like-2",
                    userId: "user-123",
                    gameId: "game-2",
                    game: { gameId: "2" },
                },
            ];
            prismaMock.userLikedGame.findMany.mockResolvedValue(mockLikedGames);
            const games = await gameService.getUserLikedGames("user-123");
            (0, vitest_1.expect)(prismaMock.userLikedGame.findMany).toHaveBeenCalledWith({
                where: { userId: "user-123" },
                include: { game: true },
            });
            (0, vitest_1.expect)(games).toHaveLength(2);
            (0, vitest_1.expect)(games).toEqual(["1", "2"]);
        });
        (0, vitest_1.it)("deve retornar array vazio quando não há jogos curtidos", async () => {
            prismaMock.userLikedGame.findMany.mockResolvedValue([]);
            const games = await gameService.getUserLikedGames("user-123");
            (0, vitest_1.expect)(games).toHaveLength(0);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            prismaMock.userLikedGame.findMany.mockRejectedValue(new Error("Database Error"));
            await (0, vitest_1.expect)(gameService.getUserLikedGames("user-123")).rejects.toThrow("Erro ao buscar jogos curtidos");
        });
    });
    (0, vitest_1.describe)("setGameStatus", () => {
        (0, vitest_1.it)("deve definir status para um novo jogo", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            prismaMock.game.findUnique.mockResolvedValue(mockGame);
            prismaMock.userGameStatus.findUnique.mockResolvedValue(null);
            prismaMock.userGameStatus.create.mockResolvedValue({
                id: "status-uuid",
                userId: "user-123",
                gameId: mockGame.id,
                status: "PLAYING",
            });
            const result = await gameService.setGameStatus("user-123", "123", "PLAYING");
            (0, vitest_1.expect)(prismaMock.userGameStatus.create).toHaveBeenCalledWith({
                data: {
                    userId: "user-123",
                    gameId: mockGame.id,
                    status: "PLAYING",
                },
            });
            (0, vitest_1.expect)(result.message).toBe("Status do jogo definido com sucesso");
            (0, vitest_1.expect)(result.status).toBe("PLAYING");
        });
        (0, vitest_1.it)("deve atualizar status quando já existe", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            const mockExistingStatus = {
                id: "status-uuid",
                userId: "user-123",
                gameId: mockGame.id,
                status: "PLAYING",
            };
            prismaMock.game.findUnique.mockResolvedValue(mockGame);
            prismaMock.userGameStatus.findUnique.mockResolvedValue(mockExistingStatus);
            prismaMock.userGameStatus.update.mockResolvedValue({
                ...mockExistingStatus,
                status: "COMPLETED",
            });
            const result = await gameService.setGameStatus("user-123", "123", "COMPLETED");
            (0, vitest_1.expect)(prismaMock.userGameStatus.update).toHaveBeenCalledWith({
                where: { id: mockExistingStatus.id },
                data: { status: "COMPLETED" },
            });
            (0, vitest_1.expect)(result.message).toBe("Status do jogo atualizado com sucesso");
            (0, vitest_1.expect)(result.status).toBe("COMPLETED");
        });
        (0, vitest_1.it)("deve criar jogo no banco se não existir", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            prismaMock.game.findUnique.mockResolvedValue(null);
            prismaMock.game.create.mockResolvedValue(mockGame);
            prismaMock.userGameStatus.findUnique.mockResolvedValue(null);
            prismaMock.userGameStatus.create.mockResolvedValue({
                id: "status-uuid",
                userId: "user-123",
                gameId: mockGame.id,
                status: "WANT_TO_PLAY",
            });
            await gameService.setGameStatus("user-123", "123", "WANT_TO_PLAY");
            (0, vitest_1.expect)(prismaMock.game.create).toHaveBeenCalledWith({
                data: { gameId: "123" },
            });
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));
            await (0, vitest_1.expect)(gameService.setGameStatus("user-123", "123", "PLAYING")).rejects.toThrow("Erro ao definir status do jogo");
        });
    });
    (0, vitest_1.describe)("removeGameStatus", () => {
        (0, vitest_1.it)("deve remover status do jogo", async () => {
            const mockGame = { id: "game-uuid", gameId: "123" };
            prismaMock.game.findUnique.mockResolvedValue(mockGame);
            prismaMock.userGameStatus.deleteMany.mockResolvedValue({ count: 1 });
            const result = await gameService.removeGameStatus("user-123", "123");
            (0, vitest_1.expect)(prismaMock.userGameStatus.deleteMany).toHaveBeenCalledWith({
                where: {
                    userId: "user-123",
                    gameId: mockGame.id,
                },
            });
            (0, vitest_1.expect)(result.message).toBe("Status do jogo removido com sucesso");
        });
        (0, vitest_1.it)("deve lançar erro quando jogo não existe", async () => {
            prismaMock.game.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(gameService.removeGameStatus("user-123", "123")).rejects.toThrow("Erro ao remover status do jogo");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));
            await (0, vitest_1.expect)(gameService.removeGameStatus("user-123", "123")).rejects.toThrow("Erro ao remover status do jogo");
        });
    });
    (0, vitest_1.describe)("getUserGamesByStatus", () => {
        (0, vitest_1.it)("deve retornar jogos do usuário por status específico", async () => {
            const mockGames = [
                {
                    id: "status-1",
                    userId: "user-123",
                    gameId: "game-1",
                    status: "PLAYING",
                    updatedAt: new Date("2023-01-01"),
                    game: { gameId: "1" },
                },
                {
                    id: "status-2",
                    userId: "user-123",
                    gameId: "game-2",
                    status: "PLAYING",
                    updatedAt: new Date("2023-01-02"),
                    game: { gameId: "2" },
                },
            ];
            prismaMock.userGameStatus.findMany.mockResolvedValue(mockGames);
            const games = await gameService.getUserGamesByStatus("user-123", "PLAYING");
            (0, vitest_1.expect)(prismaMock.userGameStatus.findMany).toHaveBeenCalledWith({
                where: { userId: "user-123", status: "PLAYING" },
                include: { game: true },
                orderBy: { updatedAt: "desc" },
            });
            (0, vitest_1.expect)(games).toHaveLength(2);
            (0, vitest_1.expect)(games[0].status).toBe("PLAYING");
        });
        (0, vitest_1.it)("deve retornar todos os jogos do usuário quando status não especificado", async () => {
            const mockGames = [
                {
                    id: "status-1",
                    userId: "user-123",
                    gameId: "game-1",
                    status: "PLAYING",
                    updatedAt: new Date(),
                    game: { gameId: "1" },
                },
                {
                    id: "status-2",
                    userId: "user-123",
                    gameId: "game-2",
                    status: "COMPLETED",
                    updatedAt: new Date(),
                    game: { gameId: "2" },
                },
            ];
            prismaMock.userGameStatus.findMany.mockResolvedValue(mockGames);
            const games = await gameService.getUserGamesByStatus("user-123");
            (0, vitest_1.expect)(prismaMock.userGameStatus.findMany).toHaveBeenCalledWith({
                where: { userId: "user-123" },
                include: { game: true },
                orderBy: { updatedAt: "desc" },
            });
            (0, vitest_1.expect)(games).toHaveLength(2);
        });
        (0, vitest_1.it)("deve retornar array vazio quando não há jogos", async () => {
            prismaMock.userGameStatus.findMany.mockResolvedValue([]);
            const games = await gameService.getUserGamesByStatus("user-123", "COMPLETED");
            (0, vitest_1.expect)(games).toHaveLength(0);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar", async () => {
            prismaMock.userGameStatus.findMany.mockRejectedValue(new Error("Database Error"));
            await (0, vitest_1.expect)(gameService.getUserGamesByStatus("user-123", "PLAYING")).rejects.toThrow("Erro ao buscar jogos por status");
        });
    });
});
