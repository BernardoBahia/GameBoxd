import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { GameService } from "../../services/game.service";
import { UserService } from "../../services/user.service";
import {
  Game,
  GameDLC,
  GameSummary,
  GameDetails,
} from "../../models/game.model";
import prisma from "../../lib/prisma";

describe("GameService - Testes de Integração", () => {
  let gameService: GameService;
  let userService: UserService;
  let testUserId: string;
  const testGameIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();

    userService = new UserService();
    const user = await userService.createUser(
      `game-test-${Date.now()}@example.com`,
      "Game Test User",
      "password123"
    );
    testUserId = user.id;
    createdUserIds.push(user.id);
  });

  afterAll(async () => {
    if (testGameIds.length > 0) {
      await prisma.userGameStatus.deleteMany({
        where: { gameId: { in: testGameIds } },
      });
      await prisma.userLikedGame.deleteMany({
        where: { gameId: { in: testGameIds } },
      });
      await prisma.game.deleteMany({
        where: { id: { in: testGameIds } },
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
    gameService = new GameService();
  });

  describe("likeGame", () => {
    it("deve curtir um jogo pela primeira vez", async () => {
      const gameId = `test-game-${Date.now()}`;

      const result = await gameService.likeGame(testUserId, gameId);

      expect(result.message).toBe("Jogo curtido com sucesso");
      expect(result.liked).toBe(true);

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      expect(game).toBeDefined();
      if (game) {
        testGameIds.push(game.id);
      }

      const like = await prisma.userLikedGame.findFirst({
        where: { userId: testUserId, gameId: game?.id },
      });
      expect(like).toBeDefined();
    });

    it("deve descurtir um jogo já curtido", async () => {
      const gameId = `test-game-unlike-${Date.now()}`;

      const likeResult = await gameService.likeGame(testUserId, gameId);
      expect(likeResult.liked).toBe(true);

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) {
        testGameIds.push(game.id);
      }

      const unlikeResult = await gameService.likeGame(testUserId, gameId);

      expect(unlikeResult.message).toBe("Curtida removida com sucesso");
      expect(unlikeResult.liked).toBe(false);

      const like = await prisma.userLikedGame.findFirst({
        where: { userId: testUserId, gameId: game?.id },
      });
      expect(like).toBeNull();
    });

    it("deve alternar entre curtir e descurtir múltiplas vezes", async () => {
      const gameId = `test-game-toggle-${Date.now()}`;

      let result = await gameService.likeGame(testUserId, gameId);
      expect(result.liked).toBe(true);

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) {
        testGameIds.push(game.id);
      }

      result = await gameService.likeGame(testUserId, gameId);
      expect(result.liked).toBe(false);

      result = await gameService.likeGame(testUserId, gameId);
      expect(result.liked).toBe(true);

      result = await gameService.likeGame(testUserId, gameId);
      expect(result.liked).toBe(false);
    });
  });

  describe("getUserLikedGames", () => {
    it("deve retornar lista de jogos curtidos pelo usuário", async () => {
      const gameId1 = `liked-game-1-${Date.now()}`;
      const gameId2 = `liked-game-2-${Date.now()}`;

      await gameService.likeGame(testUserId, gameId1);
      await gameService.likeGame(testUserId, gameId2);

      const game1: Game | null = await prisma.game.findUnique({
        where: { gameId: gameId1 },
      });
      const game2: Game | null = await prisma.game.findUnique({
        where: { gameId: gameId2 },
      });
      if (game1) testGameIds.push(game1.id);
      if (game2) testGameIds.push(game2.id);

      const likedGames = await gameService.getUserLikedGames(testUserId);

      expect(likedGames).toBeDefined();
      expect(Array.isArray(likedGames)).toBe(true);
      expect(likedGames).toContain(gameId1);
      expect(likedGames).toContain(gameId2);
    });

    it("deve retornar array vazio quando usuário não curtiu nenhum jogo", async () => {
      const newUser = await userService.createUser(
        `no-likes-${Date.now()}@example.com`,
        "No Likes User",
        "password123"
      );
      createdUserIds.push(newUser.id);

      const likedGames = await gameService.getUserLikedGames(newUser.id);

      expect(likedGames).toBeDefined();
      expect(Array.isArray(likedGames)).toBe(true);
      expect(likedGames).toHaveLength(0);
    });

    it("deve não incluir jogos que foram descurtidos", async () => {
      const gameId = `unliked-game-${Date.now()}`;

      await gameService.likeGame(testUserId, gameId);
      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) testGameIds.push(game.id);

      await gameService.likeGame(testUserId, gameId);

      const likedGames = await gameService.getUserLikedGames(testUserId);

      expect(likedGames).not.toContain(gameId);
    });
  });

  describe("setGameStatus", () => {
    it("deve definir status PLAYING para um jogo", async () => {
      const gameId = `status-playing-${Date.now()}`;

      const result = await gameService.setGameStatus(
        testUserId,
        gameId,
        "PLAYING"
      );

      expect(result.message).toBe("Status do jogo definido com sucesso");
      expect(result.status).toBe("PLAYING");

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) {
        testGameIds.push(game.id);

        const status = await prisma.userGameStatus.findFirst({
          where: { userId: testUserId, gameId: game.id },
        });
        expect(status?.status).toBe("PLAYING");
      }
    });

    it("deve definir status COMPLETED para um jogo", async () => {
      const gameId = `status-completed-${Date.now()}`;

      const result = await gameService.setGameStatus(
        testUserId,
        gameId,
        "COMPLETED"
      );

      expect(result.status).toBe("COMPLETED");

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) testGameIds.push(game.id);
    });

    it("deve definir status WANT_TO_PLAY para um jogo", async () => {
      const gameId = `status-want-${Date.now()}`;

      const result = await gameService.setGameStatus(
        testUserId,
        gameId,
        "WANT_TO_PLAY"
      );

      expect(result.status).toBe("WANT_TO_PLAY");

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) testGameIds.push(game.id);
    });

    it("deve atualizar status existente de um jogo", async () => {
      const gameId = `status-update-${Date.now()}`;

      let result = await gameService.setGameStatus(
        testUserId,
        gameId,
        "WANT_TO_PLAY"
      );
      expect(result.status).toBe("WANT_TO_PLAY");
      expect(result.message).toBe("Status do jogo definido com sucesso");

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) testGameIds.push(game.id);

      result = await gameService.setGameStatus(testUserId, gameId, "PLAYING");
      expect(result.status).toBe("PLAYING");
      expect(result.message).toBe("Status do jogo atualizado com sucesso");

      result = await gameService.setGameStatus(testUserId, gameId, "COMPLETED");
      expect(result.status).toBe("COMPLETED");
      expect(result.message).toBe("Status do jogo atualizado com sucesso");

      if (game) {
        const statuses = await prisma.userGameStatus.findMany({
          where: { userId: testUserId, gameId: game.id },
        });
        expect(statuses).toHaveLength(1);
        expect(statuses[0].status).toBe("COMPLETED");
      }
    });

    it("deve criar jogo no banco se não existir ao definir status", async () => {
      const gameId = `new-game-status-${Date.now()}`;

      let game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      expect(game).toBeNull();

      await gameService.setGameStatus(testUserId, gameId, "PLAYING");

      game = await prisma.game.findUnique({ where: { gameId } });
      expect(game).toBeDefined();
      if (game) testGameIds.push(game.id);
    });
  });

  describe("removeGameStatus", () => {
    it("deve remover status de um jogo", async () => {
      const gameId = `remove-status-${Date.now()}`;

      await gameService.setGameStatus(testUserId, gameId, "PLAYING");

      const game = await prisma.game.findUnique({ where: { gameId } });
      if (game) testGameIds.push(game.id);

      const result = await gameService.removeGameStatus(testUserId, gameId);

      expect(result.message).toBe("Status do jogo removido com sucesso");

      if (game) {
        const status = await prisma.userGameStatus.findFirst({
          where: { userId: testUserId, gameId: game.id },
        });
        expect(status).toBeNull();
      }
    });

    it("deve lançar erro ao tentar remover status de jogo inexistente", async () => {
      const nonExistentGameId = `non-existent-${Date.now()}`;

      await expect(
        gameService.removeGameStatus(testUserId, nonExistentGameId)
      ).rejects.toThrow("Erro ao remover status do jogo");
    });
  });

  describe("getUserGamesByStatus", () => {
    it("deve retornar jogos com status específico", async () => {
      const playingGame = `playing-filter-${Date.now()}`;
      const completedGame = `completed-filter-${Date.now()}`;
      const wantGame = `want-filter-${Date.now()}`;

      await gameService.setGameStatus(testUserId, playingGame, "PLAYING");
      await gameService.setGameStatus(testUserId, completedGame, "COMPLETED");
      await gameService.setGameStatus(testUserId, wantGame, "WANT_TO_PLAY");

      const game1: Game | null = await prisma.game.findUnique({
        where: { gameId: playingGame },
      });
      const game2: Game | null = await prisma.game.findUnique({
        where: { gameId: completedGame },
      });
      const game3: Game | null = await prisma.game.findUnique({
        where: { gameId: wantGame },
      });
      if (game1) testGameIds.push(game1.id);
      if (game2) testGameIds.push(game2.id);
      if (game3) testGameIds.push(game3.id);

      const playingGames = await gameService.getUserGamesByStatus(
        testUserId,
        "PLAYING"
      );

      expect(playingGames).toBeDefined();
      expect(Array.isArray(playingGames)).toBe(true);
      const playingGameIds = playingGames.map((g) => g.gameId);
      expect(playingGameIds).toContain(playingGame);
      expect(playingGameIds).not.toContain(completedGame);
      expect(playingGameIds).not.toContain(wantGame);

      playingGames.forEach((game) => {
        expect(game.status).toBe("PLAYING");
      });
    });

    it("deve retornar todos os jogos do usuário quando status não especificado", async () => {
      const game1 = `all-games-1-${Date.now()}`;
      const game2 = `all-games-2-${Date.now()}`;

      await gameService.setGameStatus(testUserId, game1, "PLAYING");
      await gameService.setGameStatus(testUserId, game2, "COMPLETED");

      const g1: Game | null = await prisma.game.findUnique({
        where: { gameId: game1 },
      });
      const g2: Game | null = await prisma.game.findUnique({
        where: { gameId: game2 },
      });
      if (g1) testGameIds.push(g1.id);
      if (g2) testGameIds.push(g2.id);

      const allGames = await gameService.getUserGamesByStatus(testUserId);

      expect(allGames).toBeDefined();
      expect(Array.isArray(allGames)).toBe(true);

      const gameIds = allGames.map((g) => g.gameId);
      expect(gameIds).toContain(game1);
      expect(gameIds).toContain(game2);
    });

    it("deve retornar jogos ordenados por data de atualização (mais recente primeiro)", async () => {
      const oldGame = `old-game-${Date.now()}`;
      const newGame = `new-game-${Date.now() + 1000}`;

      await gameService.setGameStatus(testUserId, oldGame, "PLAYING");

      await new Promise((resolve) => setTimeout(resolve, 100));

      await gameService.setGameStatus(testUserId, newGame, "PLAYING");

      const g1: Game | null = await prisma.game.findUnique({
        where: { gameId: oldGame },
      });
      const g2: Game | null = await prisma.game.findUnique({
        where: { gameId: newGame },
      });
      if (g1) testGameIds.push(g1.id);
      if (g2) testGameIds.push(g2.id);

      const games = await gameService.getUserGamesByStatus(
        testUserId,
        "PLAYING"
      );

      const gameIds = games.map((g) => g.gameId);
      const newGameIndex = gameIds.indexOf(newGame);
      const oldGameIndex = gameIds.indexOf(oldGame);

      expect(newGameIndex).toBeLessThan(oldGameIndex);
    });

    it("deve retornar array vazio quando usuário não tem jogos com status", async () => {
      const newUser = await userService.createUser(
        `no-games-${Date.now()}@example.com`,
        "No Games User",
        "password123"
      );
      createdUserIds.push(newUser.id);

      const games = await gameService.getUserGamesByStatus(newUser.id);

      expect(games).toBeDefined();
      expect(Array.isArray(games)).toBe(true);
      expect(games).toHaveLength(0);
    });

    it("deve incluir updatedAt em cada jogo retornado", async () => {
      const gameId = `updated-at-${Date.now()}`;

      await gameService.setGameStatus(testUserId, gameId, "PLAYING");

      const game = await prisma.game.findUnique({ where: { gameId } });
      if (game) testGameIds.push(game.id);

      const games = await gameService.getUserGamesByStatus(
        testUserId,
        "PLAYING"
      );

      const targetGame = games.find((g) => g.gameId === gameId);
      expect(targetGame).toBeDefined();
      expect(targetGame?.updatedAt).toBeDefined();
      expect(targetGame?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Fluxo completo de operações de jogo", () => {
    it("deve executar ciclo completo: curtir, definir status, atualizar status, remover", async () => {
      const gameId = `full-flow-${Date.now()}`;

      let result = await gameService.likeGame(testUserId, gameId);
      expect(result.liked).toBe(true);

      const game: Game | null = await prisma.game.findUnique({
        where: { gameId },
      });
      if (game) testGameIds.push(game.id);

      let likedGames = await gameService.getUserLikedGames(testUserId);
      expect(likedGames).toContain(gameId);

      let statusResult = await gameService.setGameStatus(
        testUserId,
        gameId,
        "WANT_TO_PLAY"
      );
      expect(statusResult.status).toBe("WANT_TO_PLAY");

      let gamesByStatus = await gameService.getUserGamesByStatus(testUserId);
      expect(gamesByStatus.some((g) => g.gameId === gameId)).toBe(true);

      statusResult = await gameService.setGameStatus(
        testUserId,
        gameId,
        "PLAYING"
      );
      expect(statusResult.status).toBe("PLAYING");

      statusResult = await gameService.setGameStatus(
        testUserId,
        gameId,
        "COMPLETED"
      );
      expect(statusResult.status).toBe("COMPLETED");

      const removeResult = await gameService.removeGameStatus(
        testUserId,
        gameId
      );
      expect(removeResult.message).toBe("Status do jogo removido com sucesso");

      gamesByStatus = await gameService.getUserGamesByStatus(testUserId);
      expect(gamesByStatus.some((g) => g.gameId === gameId)).toBe(false);

      result = await gameService.likeGame(testUserId, gameId);
      expect(result.liked).toBe(false);

      likedGames = await gameService.getUserLikedGames(testUserId);
      expect(likedGames).not.toContain(gameId);
    });
  });

  describe("Testes de API RAWG - getGames", () => {
    it("deve retornar lista de jogos com tipo GameSummary", async () => {
      const games: GameSummary[] = await gameService.getGames(1, 5);

      expect(games).toBeDefined();
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      expect(games.length).toBeLessThanOrEqual(5);

      games.forEach((game: GameSummary) => {
        expect(game).toHaveProperty("id");
        expect(game).toHaveProperty("name");
        expect(game).toHaveProperty("released");
        expect(game).toHaveProperty("background_image");
        expect(typeof game.id).toBe("number");
        expect(typeof game.name).toBe("string");
      });
    });
  });

  describe("Testes de API RAWG - searchGames", () => {
    it("deve buscar jogos e retornar GameDetails com DLCs", async () => {
      const searchResults: GameDetails[] = await gameService.searchGames(
        "The Witcher",
        1,
        2
      );

      expect(searchResults).toBeDefined();
      expect(Array.isArray(searchResults)).toBe(true);

      if (searchResults.length > 0) {
        const game: GameDetails = searchResults[0];

        expect(game).toHaveProperty("id");
        expect(game).toHaveProperty("name");
        expect(game).toHaveProperty("released");
        expect(game).toHaveProperty("background_image");
        expect(game).toHaveProperty("genres");
        expect(game).toHaveProperty("developers");
        expect(game).toHaveProperty("publishers");
        expect(game).toHaveProperty("platforms");
        expect(game).toHaveProperty("dlcs");

        expect(Array.isArray(game.genres)).toBe(true);
        expect(Array.isArray(game.developers)).toBe(true);
        expect(Array.isArray(game.publishers)).toBe(true);
        expect(Array.isArray(game.platforms)).toBe(true);
        expect(Array.isArray(game.dlcs)).toBe(true);

        if (game.dlcs.length > 0) {
          const dlc: GameDLC = game.dlcs[0];
          expect(dlc).toHaveProperty("id");
          expect(dlc).toHaveProperty("name");
          expect(dlc).toHaveProperty("released");
          expect(typeof dlc.id).toBe("number");
          expect(typeof dlc.name).toBe("string");
        }
      }
    });
  });

  describe("Testes de API RAWG - getGameDetails", () => {
    it("deve obter detalhes completos de um jogo específico", async () => {
      const gameDetails: GameDetails = await gameService.getGameDetails(3328);

      expect(gameDetails).toBeDefined();
      expect(gameDetails.id).toBe(3328);
      expect(gameDetails.name).toBeDefined();
      expect(typeof gameDetails.name).toBe("string");

      expect(Array.isArray(gameDetails.genres)).toBe(true);
      expect(Array.isArray(gameDetails.developers)).toBe(true);
      expect(Array.isArray(gameDetails.publishers)).toBe(true);
      expect(Array.isArray(gameDetails.platforms)).toBe(true);
      expect(Array.isArray(gameDetails.dlcs)).toBe(true);

      if (gameDetails.dlcs.length > 0) {
        gameDetails.dlcs.forEach((dlc: GameDLC) => {
          expect(dlc).toHaveProperty("id");
          expect(dlc).toHaveProperty("name");
          expect(dlc).toHaveProperty("released");
        });
      }
    });
  });
});
