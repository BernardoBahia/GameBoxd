import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameService } from "../../services/game.service";
import { PrismaClient } from "@prisma/client";

vi.mock("axios");

vi.mock("@prisma/client", () => {
  const mockGame = {
    findUnique: vi.fn(),
    create: vi.fn(),
  };
  const mockUserLikedGame = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const mockUserGameStatus = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  return {
    PrismaClient: class {
      game = mockGame;
      userLikedGame = mockUserLikedGame;
      userGameStatus = mockUserGameStatus;
    },
  };
});

import type { Mock } from "vitest";

const prisma = new PrismaClient();
const prismaMock = {
  game: prisma.game as unknown as {
    findUnique: Mock;
    create: Mock;
  },
  userLikedGame: prisma.userLikedGame as unknown as {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
    delete: Mock;
  },
  userGameStatus: prisma.userGameStatus as unknown as {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
    update: Mock;
    deleteMany: Mock;
  },
};

describe("GameService", () => {
  let gameService: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    gameService = new GameService();
  });

  describe("likeGame", () => {
    it("deve curtir um jogo quando ainda não curtido", async () => {
      const mockGame = { id: "game-uuid", gameId: "123" };

      prismaMock.game.findUnique.mockResolvedValue(mockGame);
      prismaMock.userLikedGame.findUnique.mockResolvedValue(null);
      prismaMock.userLikedGame.create.mockResolvedValue({
        id: "like-uuid",
        userId: "user-123",
        gameId: mockGame.id,
      });

      const result = await gameService.likeGame("user-123", "123");

      expect(prismaMock.game.findUnique).toHaveBeenCalledWith({
        where: { gameId: "123" },
      });
      expect(prismaMock.userLikedGame.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          gameId: mockGame.id,
        },
      });
      expect(result.message).toBe("Jogo curtido com sucesso");
      expect(result.liked).toBe(true);
    });

    it("deve descurtir um jogo quando já curtido", async () => {
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

      expect(prismaMock.userLikedGame.delete).toHaveBeenCalledWith({
        where: { id: mockLike.id },
      });
      expect(result.message).toBe("Curtida removida com sucesso");
      expect(result.liked).toBe(false);
    });

    it("deve criar jogo no banco se não existir", async () => {
      const mockGame = { id: "game-uuid", gameId: "123", isLiked: false };

      prismaMock.game.findUnique.mockResolvedValue(null);
      prismaMock.game.create.mockResolvedValue(mockGame);
      prismaMock.userLikedGame.findUnique.mockResolvedValue(null);
      prismaMock.userLikedGame.create.mockResolvedValue({
        id: "like-uuid",
        userId: "user-123",
        gameId: mockGame.id,
      });

      await gameService.likeGame("user-123", "123");

      expect(prismaMock.game.create).toHaveBeenCalledWith({
        data: { gameId: "123", isLiked: false },
      });
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));

      await expect(gameService.likeGame("user-123", "123")).rejects.toThrow(
        "Erro ao curtir jogo"
      );
    });
  });

  describe("getUserLikedGames", () => {
    it("deve retornar lista de jogos curtidos pelo usuário", async () => {
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

      expect(prismaMock.userLikedGame.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        include: { game: true },
      });
      expect(games).toHaveLength(2);
      expect(games).toEqual(["1", "2"]);
    });

    it("deve retornar array vazio quando não há jogos curtidos", async () => {
      prismaMock.userLikedGame.findMany.mockResolvedValue([]);

      const games = await gameService.getUserLikedGames("user-123");

      expect(games).toHaveLength(0);
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.userLikedGame.findMany.mockRejectedValue(
        new Error("Database Error")
      );

      await expect(gameService.getUserLikedGames("user-123")).rejects.toThrow(
        "Erro ao buscar jogos curtidos"
      );
    });
  });

  describe("setGameStatus", () => {
    it("deve definir status para um novo jogo", async () => {
      const mockGame = { id: "game-uuid", gameId: "123" };

      prismaMock.game.findUnique.mockResolvedValue(mockGame);
      prismaMock.userGameStatus.findUnique.mockResolvedValue(null);
      prismaMock.userGameStatus.create.mockResolvedValue({
        id: "status-uuid",
        userId: "user-123",
        gameId: mockGame.id,
        status: "PLAYING",
      });

      const result = await gameService.setGameStatus(
        "user-123",
        "123",
        "PLAYING"
      );

      expect(prismaMock.userGameStatus.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          gameId: mockGame.id,
          status: "PLAYING",
        },
      });
      expect(result.message).toBe("Status do jogo definido com sucesso");
      expect(result.status).toBe("PLAYING");
    });

    it("deve atualizar status quando já existe", async () => {
      const mockGame = { id: "game-uuid", gameId: "123" };
      const mockExistingStatus = {
        id: "status-uuid",
        userId: "user-123",
        gameId: mockGame.id,
        status: "PLAYING",
      };

      prismaMock.game.findUnique.mockResolvedValue(mockGame);
      prismaMock.userGameStatus.findUnique.mockResolvedValue(
        mockExistingStatus
      );
      prismaMock.userGameStatus.update.mockResolvedValue({
        ...mockExistingStatus,
        status: "COMPLETED",
      });

      const result = await gameService.setGameStatus(
        "user-123",
        "123",
        "COMPLETED"
      );

      expect(prismaMock.userGameStatus.update).toHaveBeenCalledWith({
        where: { id: mockExistingStatus.id },
        data: { status: "COMPLETED" },
      });
      expect(result.message).toBe("Status do jogo atualizado com sucesso");
      expect(result.status).toBe("COMPLETED");
    });

    it("deve criar jogo no banco se não existir", async () => {
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

      expect(prismaMock.game.create).toHaveBeenCalledWith({
        data: { gameId: "123" },
      });
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));

      await expect(
        gameService.setGameStatus("user-123", "123", "PLAYING")
      ).rejects.toThrow("Erro ao definir status do jogo");
    });
  });

  describe("removeGameStatus", () => {
    it("deve remover status do jogo", async () => {
      const mockGame = { id: "game-uuid", gameId: "123" };

      prismaMock.game.findUnique.mockResolvedValue(mockGame);
      prismaMock.userGameStatus.deleteMany.mockResolvedValue({ count: 1 });

      const result = await gameService.removeGameStatus("user-123", "123");

      expect(prismaMock.userGameStatus.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          gameId: mockGame.id,
        },
      });
      expect(result.message).toBe("Status do jogo removido com sucesso");
    });

    it("deve lançar erro quando jogo não existe", async () => {
      prismaMock.game.findUnique.mockResolvedValue(null);

      await expect(
        gameService.removeGameStatus("user-123", "123")
      ).rejects.toThrow("Erro ao remover status do jogo");
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));

      await expect(
        gameService.removeGameStatus("user-123", "123")
      ).rejects.toThrow("Erro ao remover status do jogo");
    });
  });

  describe("getUserGamesByStatus", () => {
    it("deve retornar jogos do usuário por status específico", async () => {
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

      const games = await gameService.getUserGamesByStatus(
        "user-123",
        "PLAYING"
      );

      expect(prismaMock.userGameStatus.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123", status: "PLAYING" },
        include: { game: true },
        orderBy: { updatedAt: "desc" },
      });
      expect(games).toHaveLength(2);
      expect(games[0].status).toBe("PLAYING");
    });

    it("deve retornar todos os jogos do usuário quando status não especificado", async () => {
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

      expect(prismaMock.userGameStatus.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        include: { game: true },
        orderBy: { updatedAt: "desc" },
      });
      expect(games).toHaveLength(2);
    });

    it("deve retornar array vazio quando não há jogos", async () => {
      prismaMock.userGameStatus.findMany.mockResolvedValue([]);

      const games = await gameService.getUserGamesByStatus(
        "user-123",
        "COMPLETED"
      );

      expect(games).toHaveLength(0);
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.userGameStatus.findMany.mockRejectedValue(
        new Error("Database Error")
      );

      await expect(
        gameService.getUserGamesByStatus("user-123", "PLAYING")
      ).rejects.toThrow("Erro ao buscar jogos por status");
    });
  });
});
