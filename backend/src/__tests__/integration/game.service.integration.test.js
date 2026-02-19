"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const game_service_1 = require("../../services/game.service");
const user_service_1 = require("../../services/user.service");
const prisma_1 = __importDefault(require("../../lib/prisma"));
(0, vitest_1.describe)("GameService - Testes de Integração", () => {
    let gameService;
    let userService;
    let testUserId;
    const testGameIds = [];
    const createdUserIds = [];
    (0, vitest_1.beforeAll)(async () => {
        await prisma_1.default.$connect();
        userService = new user_service_1.UserService();
        const user = await userService.createUser(`game-test-${Date.now()}@example.com`, "Game Test User", "password123");
        testUserId = user.id;
        createdUserIds.push(user.id);
    });
    (0, vitest_1.afterAll)(async () => {
        if (testGameIds.length > 0) {
            await prisma_1.default.userGameStatus.deleteMany({
                where: { gameId: { in: testGameIds } },
            });
            await prisma_1.default.userLikedGame.deleteMany({
                where: { gameId: { in: testGameIds } },
            });
            await prisma_1.default.game.deleteMany({
                where: { id: { in: testGameIds } },
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
        gameService = new game_service_1.GameService();
    });
    (0, vitest_1.describe)("likeGame", () => {
        (0, vitest_1.it)("deve curtir um jogo pela primeira vez", async () => {
            const gameId = `test-game-${Date.now()}`;
            const result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.message).toBe("Jogo curtido com sucesso");
            (0, vitest_1.expect)(result.liked).toBe(true);
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            (0, vitest_1.expect)(game).toBeDefined();
            if (game) {
                testGameIds.push(game.id);
            }
            const like = await prisma_1.default.userLikedGame.findFirst({
                where: { userId: testUserId, gameId: game?.id },
            });
            (0, vitest_1.expect)(like).toBeDefined();
        });
        (0, vitest_1.it)("deve descurtir um jogo já curtido", async () => {
            const gameId = `test-game-unlike-${Date.now()}`;
            const likeResult = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(likeResult.liked).toBe(true);
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game) {
                testGameIds.push(game.id);
            }
            const unlikeResult = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(unlikeResult.message).toBe("Curtida removida com sucesso");
            (0, vitest_1.expect)(unlikeResult.liked).toBe(false);
            const like = await prisma_1.default.userLikedGame.findFirst({
                where: { userId: testUserId, gameId: game?.id },
            });
            (0, vitest_1.expect)(like).toBeNull();
        });
        (0, vitest_1.it)("deve alternar entre curtir e descurtir múltiplas vezes", async () => {
            const gameId = `test-game-toggle-${Date.now()}`;
            let result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.liked).toBe(true);
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game) {
                testGameIds.push(game.id);
            }
            result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.liked).toBe(false);
            result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.liked).toBe(true);
            result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.liked).toBe(false);
        });
    });
    (0, vitest_1.describe)("getUserLikedGames", () => {
        (0, vitest_1.it)("deve retornar lista de jogos curtidos pelo usuário", async () => {
            const gameId1 = `liked-game-1-${Date.now()}`;
            const gameId2 = `liked-game-2-${Date.now()}`;
            await gameService.likeGame(testUserId, gameId1);
            await gameService.likeGame(testUserId, gameId2);
            const game1 = await prisma_1.default.game.findUnique({
                where: { gameId: gameId1 },
            });
            const game2 = await prisma_1.default.game.findUnique({
                where: { gameId: gameId2 },
            });
            if (game1)
                testGameIds.push(game1.id);
            if (game2)
                testGameIds.push(game2.id);
            const likedGames = await gameService.getUserLikedGames(testUserId);
            (0, vitest_1.expect)(likedGames).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(likedGames)).toBe(true);
            (0, vitest_1.expect)(likedGames).toContain(gameId1);
            (0, vitest_1.expect)(likedGames).toContain(gameId2);
        });
        (0, vitest_1.it)("deve retornar array vazio quando usuário não curtiu nenhum jogo", async () => {
            const newUser = await userService.createUser(`no-likes-${Date.now()}@example.com`, "No Likes User", "password123");
            createdUserIds.push(newUser.id);
            const likedGames = await gameService.getUserLikedGames(newUser.id);
            (0, vitest_1.expect)(likedGames).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(likedGames)).toBe(true);
            (0, vitest_1.expect)(likedGames).toHaveLength(0);
        });
        (0, vitest_1.it)("deve não incluir jogos que foram descurtidos", async () => {
            const gameId = `unliked-game-${Date.now()}`;
            await gameService.likeGame(testUserId, gameId);
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game)
                testGameIds.push(game.id);
            await gameService.likeGame(testUserId, gameId);
            const likedGames = await gameService.getUserLikedGames(testUserId);
            (0, vitest_1.expect)(likedGames).not.toContain(gameId);
        });
    });
    (0, vitest_1.describe)("setGameStatus", () => {
        (0, vitest_1.it)("deve definir status PLAYING para um jogo", async () => {
            const gameId = `status-playing-${Date.now()}`;
            const result = await gameService.setGameStatus(testUserId, gameId, "PLAYING");
            (0, vitest_1.expect)(result.message).toBe("Status do jogo definido com sucesso");
            (0, vitest_1.expect)(result.status).toBe("PLAYING");
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game) {
                testGameIds.push(game.id);
                const status = await prisma_1.default.userGameStatus.findFirst({
                    where: { userId: testUserId, gameId: game.id },
                });
                (0, vitest_1.expect)(status?.status).toBe("PLAYING");
            }
        });
        (0, vitest_1.it)("deve definir status COMPLETED para um jogo", async () => {
            const gameId = `status-completed-${Date.now()}`;
            const result = await gameService.setGameStatus(testUserId, gameId, "COMPLETED");
            (0, vitest_1.expect)(result.status).toBe("COMPLETED");
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game)
                testGameIds.push(game.id);
        });
        (0, vitest_1.it)("deve definir status WANT_TO_PLAY para um jogo", async () => {
            const gameId = `status-want-${Date.now()}`;
            const result = await gameService.setGameStatus(testUserId, gameId, "WANT_TO_PLAY");
            (0, vitest_1.expect)(result.status).toBe("WANT_TO_PLAY");
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game)
                testGameIds.push(game.id);
        });
        (0, vitest_1.it)("deve atualizar status existente de um jogo", async () => {
            const gameId = `status-update-${Date.now()}`;
            let result = await gameService.setGameStatus(testUserId, gameId, "WANT_TO_PLAY");
            (0, vitest_1.expect)(result.status).toBe("WANT_TO_PLAY");
            (0, vitest_1.expect)(result.message).toBe("Status do jogo definido com sucesso");
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game)
                testGameIds.push(game.id);
            result = await gameService.setGameStatus(testUserId, gameId, "PLAYING");
            (0, vitest_1.expect)(result.status).toBe("PLAYING");
            (0, vitest_1.expect)(result.message).toBe("Status do jogo atualizado com sucesso");
            result = await gameService.setGameStatus(testUserId, gameId, "COMPLETED");
            (0, vitest_1.expect)(result.status).toBe("COMPLETED");
            (0, vitest_1.expect)(result.message).toBe("Status do jogo atualizado com sucesso");
            if (game) {
                const statuses = await prisma_1.default.userGameStatus.findMany({
                    where: { userId: testUserId, gameId: game.id },
                });
                (0, vitest_1.expect)(statuses).toHaveLength(1);
                (0, vitest_1.expect)(statuses[0].status).toBe("COMPLETED");
            }
        });
        (0, vitest_1.it)("deve criar jogo no banco se não existir ao definir status", async () => {
            const gameId = `new-game-status-${Date.now()}`;
            let game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            (0, vitest_1.expect)(game).toBeNull();
            await gameService.setGameStatus(testUserId, gameId, "PLAYING");
            game = await prisma_1.default.game.findUnique({ where: { gameId } });
            (0, vitest_1.expect)(game).toBeDefined();
            if (game)
                testGameIds.push(game.id);
        });
    });
    (0, vitest_1.describe)("removeGameStatus", () => {
        (0, vitest_1.it)("deve remover status de um jogo", async () => {
            const gameId = `remove-status-${Date.now()}`;
            await gameService.setGameStatus(testUserId, gameId, "PLAYING");
            const game = await prisma_1.default.game.findUnique({ where: { gameId } });
            if (game)
                testGameIds.push(game.id);
            const result = await gameService.removeGameStatus(testUserId, gameId);
            (0, vitest_1.expect)(result.message).toBe("Status do jogo removido com sucesso");
            if (game) {
                const status = await prisma_1.default.userGameStatus.findFirst({
                    where: { userId: testUserId, gameId: game.id },
                });
                (0, vitest_1.expect)(status).toBeNull();
            }
        });
        (0, vitest_1.it)("deve lançar erro ao tentar remover status de jogo inexistente", async () => {
            const nonExistentGameId = `non-existent-${Date.now()}`;
            await (0, vitest_1.expect)(gameService.removeGameStatus(testUserId, nonExistentGameId)).rejects.toThrow("Erro ao remover status do jogo");
        });
    });
    (0, vitest_1.describe)("getUserGamesByStatus", () => {
        (0, vitest_1.it)("deve retornar jogos com status específico", async () => {
            const playingGame = `playing-filter-${Date.now()}`;
            const completedGame = `completed-filter-${Date.now()}`;
            const wantGame = `want-filter-${Date.now()}`;
            await gameService.setGameStatus(testUserId, playingGame, "PLAYING");
            await gameService.setGameStatus(testUserId, completedGame, "COMPLETED");
            await gameService.setGameStatus(testUserId, wantGame, "WANT_TO_PLAY");
            const game1 = await prisma_1.default.game.findUnique({
                where: { gameId: playingGame },
            });
            const game2 = await prisma_1.default.game.findUnique({
                where: { gameId: completedGame },
            });
            const game3 = await prisma_1.default.game.findUnique({
                where: { gameId: wantGame },
            });
            if (game1)
                testGameIds.push(game1.id);
            if (game2)
                testGameIds.push(game2.id);
            if (game3)
                testGameIds.push(game3.id);
            const playingGames = await gameService.getUserGamesByStatus(testUserId, "PLAYING");
            (0, vitest_1.expect)(playingGames).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(playingGames)).toBe(true);
            const playingGameIds = playingGames.map((g) => g.gameId);
            (0, vitest_1.expect)(playingGameIds).toContain(playingGame);
            (0, vitest_1.expect)(playingGameIds).not.toContain(completedGame);
            (0, vitest_1.expect)(playingGameIds).not.toContain(wantGame);
            playingGames.forEach((game) => {
                (0, vitest_1.expect)(game.status).toBe("PLAYING");
            });
        });
        (0, vitest_1.it)("deve retornar todos os jogos do usuário quando status não especificado", async () => {
            const game1 = `all-games-1-${Date.now()}`;
            const game2 = `all-games-2-${Date.now()}`;
            await gameService.setGameStatus(testUserId, game1, "PLAYING");
            await gameService.setGameStatus(testUserId, game2, "COMPLETED");
            const g1 = await prisma_1.default.game.findUnique({
                where: { gameId: game1 },
            });
            const g2 = await prisma_1.default.game.findUnique({
                where: { gameId: game2 },
            });
            if (g1)
                testGameIds.push(g1.id);
            if (g2)
                testGameIds.push(g2.id);
            const allGames = await gameService.getUserGamesByStatus(testUserId);
            (0, vitest_1.expect)(allGames).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(allGames)).toBe(true);
            const gameIds = allGames.map((g) => g.gameId);
            (0, vitest_1.expect)(gameIds).toContain(game1);
            (0, vitest_1.expect)(gameIds).toContain(game2);
        });
        (0, vitest_1.it)("deve retornar jogos ordenados por data de atualização (mais recente primeiro)", async () => {
            const oldGame = `old-game-${Date.now()}`;
            const newGame = `new-game-${Date.now() + 1000}`;
            await gameService.setGameStatus(testUserId, oldGame, "PLAYING");
            await new Promise((resolve) => setTimeout(resolve, 100));
            await gameService.setGameStatus(testUserId, newGame, "PLAYING");
            const g1 = await prisma_1.default.game.findUnique({
                where: { gameId: oldGame },
            });
            const g2 = await prisma_1.default.game.findUnique({
                where: { gameId: newGame },
            });
            if (g1)
                testGameIds.push(g1.id);
            if (g2)
                testGameIds.push(g2.id);
            const games = await gameService.getUserGamesByStatus(testUserId, "PLAYING");
            const gameIds = games.map((g) => g.gameId);
            const newGameIndex = gameIds.indexOf(newGame);
            const oldGameIndex = gameIds.indexOf(oldGame);
            (0, vitest_1.expect)(newGameIndex).toBeLessThan(oldGameIndex);
        });
        (0, vitest_1.it)("deve retornar array vazio quando usuário não tem jogos com status", async () => {
            const newUser = await userService.createUser(`no-games-${Date.now()}@example.com`, "No Games User", "password123");
            createdUserIds.push(newUser.id);
            const games = await gameService.getUserGamesByStatus(newUser.id);
            (0, vitest_1.expect)(games).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(games)).toBe(true);
            (0, vitest_1.expect)(games).toHaveLength(0);
        });
        (0, vitest_1.it)("deve incluir updatedAt em cada jogo retornado", async () => {
            const gameId = `updated-at-${Date.now()}`;
            await gameService.setGameStatus(testUserId, gameId, "PLAYING");
            const game = await prisma_1.default.game.findUnique({ where: { gameId } });
            if (game)
                testGameIds.push(game.id);
            const games = await gameService.getUserGamesByStatus(testUserId, "PLAYING");
            const targetGame = games.find((g) => g.gameId === gameId);
            (0, vitest_1.expect)(targetGame).toBeDefined();
            (0, vitest_1.expect)(targetGame?.updatedAt).toBeDefined();
            (0, vitest_1.expect)(targetGame?.updatedAt).toBeInstanceOf(Date);
        });
    });
    (0, vitest_1.describe)("Fluxo completo de operações de jogo", () => {
        (0, vitest_1.it)("deve executar ciclo completo: curtir, definir status, atualizar status, remover", async () => {
            const gameId = `full-flow-${Date.now()}`;
            let result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.liked).toBe(true);
            const game = await prisma_1.default.game.findUnique({
                where: { gameId },
            });
            if (game)
                testGameIds.push(game.id);
            let likedGames = await gameService.getUserLikedGames(testUserId);
            (0, vitest_1.expect)(likedGames).toContain(gameId);
            let statusResult = await gameService.setGameStatus(testUserId, gameId, "WANT_TO_PLAY");
            (0, vitest_1.expect)(statusResult.status).toBe("WANT_TO_PLAY");
            let gamesByStatus = await gameService.getUserGamesByStatus(testUserId);
            (0, vitest_1.expect)(gamesByStatus.some((g) => g.gameId === gameId)).toBe(true);
            statusResult = await gameService.setGameStatus(testUserId, gameId, "PLAYING");
            (0, vitest_1.expect)(statusResult.status).toBe("PLAYING");
            statusResult = await gameService.setGameStatus(testUserId, gameId, "COMPLETED");
            (0, vitest_1.expect)(statusResult.status).toBe("COMPLETED");
            const removeResult = await gameService.removeGameStatus(testUserId, gameId);
            (0, vitest_1.expect)(removeResult.message).toBe("Status do jogo removido com sucesso");
            gamesByStatus = await gameService.getUserGamesByStatus(testUserId);
            (0, vitest_1.expect)(gamesByStatus.some((g) => g.gameId === gameId)).toBe(false);
            result = await gameService.likeGame(testUserId, gameId);
            (0, vitest_1.expect)(result.liked).toBe(false);
            likedGames = await gameService.getUserLikedGames(testUserId);
            (0, vitest_1.expect)(likedGames).not.toContain(gameId);
        });
    });
    (0, vitest_1.describe)("Testes de API RAWG - getGames", () => {
        (0, vitest_1.it)("deve retornar lista de jogos com tipo GameSummary", async () => {
            const games = await gameService.getGames(1, 5);
            (0, vitest_1.expect)(games).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(games)).toBe(true);
            (0, vitest_1.expect)(games.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(games.length).toBeLessThanOrEqual(5);
            games.forEach((game) => {
                (0, vitest_1.expect)(game).toHaveProperty("id");
                (0, vitest_1.expect)(game).toHaveProperty("name");
                (0, vitest_1.expect)(game).toHaveProperty("released");
                (0, vitest_1.expect)(game).toHaveProperty("background_image");
                (0, vitest_1.expect)(typeof game.id).toBe("number");
                (0, vitest_1.expect)(typeof game.name).toBe("string");
            });
        });
    });
    (0, vitest_1.describe)("Testes de API RAWG - searchGames", () => {
        (0, vitest_1.it)("deve buscar jogos e retornar GameDetails com DLCs", async () => {
            const searchResults = await gameService.searchGames("The Witcher", 1, 2);
            (0, vitest_1.expect)(searchResults).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(searchResults)).toBe(true);
            if (searchResults.length > 0) {
                const game = searchResults[0];
                (0, vitest_1.expect)(game).toHaveProperty("id");
                (0, vitest_1.expect)(game).toHaveProperty("name");
                (0, vitest_1.expect)(game).toHaveProperty("released");
                (0, vitest_1.expect)(game).toHaveProperty("background_image");
                (0, vitest_1.expect)(game).toHaveProperty("genres");
                (0, vitest_1.expect)(game).toHaveProperty("developers");
                (0, vitest_1.expect)(game).toHaveProperty("publishers");
                (0, vitest_1.expect)(game).toHaveProperty("platforms");
                (0, vitest_1.expect)(game).toHaveProperty("dlcs");
                (0, vitest_1.expect)(Array.isArray(game.genres)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(game.developers)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(game.publishers)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(game.platforms)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(game.dlcs)).toBe(true);
                if (game.dlcs.length > 0) {
                    const dlc = game.dlcs[0];
                    (0, vitest_1.expect)(dlc).toHaveProperty("id");
                    (0, vitest_1.expect)(dlc).toHaveProperty("name");
                    (0, vitest_1.expect)(dlc).toHaveProperty("released");
                    (0, vitest_1.expect)(typeof dlc.id).toBe("number");
                    (0, vitest_1.expect)(typeof dlc.name).toBe("string");
                }
            }
        });
    });
    (0, vitest_1.describe)("Testes de API RAWG - getGameDetails", () => {
        (0, vitest_1.it)("deve obter detalhes completos de um jogo específico", async () => {
            const gameDetails = await gameService.getGameDetails(3328);
            (0, vitest_1.expect)(gameDetails).toBeDefined();
            (0, vitest_1.expect)(gameDetails.id).toBe(3328);
            (0, vitest_1.expect)(gameDetails.name).toBeDefined();
            (0, vitest_1.expect)(typeof gameDetails.name).toBe("string");
            (0, vitest_1.expect)(Array.isArray(gameDetails.genres)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(gameDetails.developers)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(gameDetails.publishers)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(gameDetails.platforms)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(gameDetails.dlcs)).toBe(true);
            if (gameDetails.dlcs.length > 0) {
                gameDetails.dlcs.forEach((dlc) => {
                    (0, vitest_1.expect)(dlc).toHaveProperty("id");
                    (0, vitest_1.expect)(dlc).toHaveProperty("name");
                    (0, vitest_1.expect)(dlc).toHaveProperty("released");
                });
            }
        });
    });
});
