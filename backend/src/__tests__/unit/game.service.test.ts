import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import { PrismaClient } from "@prisma/client";
import { Game } from "../../models/game.model";

let mockAxiosGet = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: () => ({
      get: (...args: any[]) => mockAxiosGet(...args),
    }),
  },
}));

import { GameService } from "../../services/game.service";

vi.mock("@prisma/client", () => {
  const mockGame = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };
  const mockReview = {
    groupBy: vi.fn(),
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
      review = mockReview;
      userLikedGame = mockUserLikedGame;
      userGameStatus = mockUserGameStatus;
    },
  };
});

const prisma = new PrismaClient();
const prismaMock = {
  game: prisma.game as unknown as {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
  },
  review: prisma.review as unknown as {
    groupBy: Mock;
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

    // GameService now enriches RAWG responses with GameBoxd ratings via Prisma.
    // Default to no ratings in unit tests unless a test opts in.
    prismaMock.game.findMany.mockResolvedValue([]);
    prismaMock.review.groupBy.mockResolvedValue([]);
  });

  // ==========================================================================
  // TESTES DE MÉTODOS DE API EXTERNA (RAWG)
  // ==========================================================================

  describe("getGames", () => {
    it("deve retornar lista de jogos da API", async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          count: 2,
          next: null,
          previous: null,
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

      const response = await gameService.getGames(1, 10);

      expect(response.results).toHaveLength(2);
      expect(response.count).toBe(2);
      expect(response.next).toBeNull();
      expect(response.previous).toBeNull();
      expect(response.results[0].name).toBe("Game 1");
      expect(response.results[1].name).toBe("Game 2");
    });

    it("deve lançar erro quando API falhar", async () => {
      mockAxiosGet.mockRejectedValue(new Error("API Error"));

      await expect(gameService.getGames()).rejects.toThrow(
        "Erro ao obter jogos",
      );
    });
  });

  describe("searchGames", () => {
    it("deve buscar jogos por query com detalhes completos", async () => {
      mockAxiosGet
        .mockResolvedValueOnce({
          data: {
            count: 1,
            next: null,
            previous: null,
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
            count: 0,
            next: null,
            previous: null,
            results: [],
          },
        });

      const response = await gameService.searchGames("minecraft", 1, 10);

      expect(response.results).toHaveLength(1);
      expect(response.count).toBe(1);
      expect(response.next).toBeNull();
      expect(response.previous).toBeNull();
      expect(response.results[0].name).toBe("Minecraft");
      expect(response.results[0].genres).toContain("Sandbox");
      expect(response.results[0].developers).toContain("Mojang");
    });

    it("deve lançar erro quando busca falhar", async () => {
      mockAxiosGet.mockRejectedValue(new Error("API Error"));

      await expect(gameService.searchGames("test")).rejects.toThrow(
        "Erro ao buscar jogos",
      );
    });
  });

  describe("searchGamesByPlatform", () => {
    it("deve buscar jogos por plataforma", async () => {
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

      expect(games).toHaveLength(1);
      expect(games[0].name).toBe("Halo");
    });

    it("deve lançar erro ao falhar", async () => {
      mockAxiosGet.mockRejectedValue(new Error("API Error"));

      await expect(gameService.searchGamesByPlatform(186)).rejects.toThrow(
        "Erro ao buscar jogos por plataforma",
      );
    });
  });

  describe("searchGamesByGenre", () => {
    it("deve buscar jogos por gênero", async () => {
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

      expect(games).toHaveLength(1);
      expect(games[0].name).toBe("Dark Souls");
      expect(games[0].genres).toContain("RPG");
    });

    it("deve lançar erro ao falhar", async () => {
      mockAxiosGet.mockRejectedValue(new Error("API Error"));

      await expect(gameService.searchGamesByGenre(5)).rejects.toThrow(
        "Erro ao buscar jogos por gênero",
      );
    });
  });

  describe("searchGamesByDlc", () => {
    it("deve buscar jogos por DLC", async () => {
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

      expect(games).toHaveLength(1);
      expect(games[0].name).toBe("Witcher DLC");
    });

    it("deve lançar erro ao falhar", async () => {
      mockAxiosGet.mockRejectedValue(new Error("API Error"));

      await expect(gameService.searchGamesByDlc(100)).rejects.toThrow(
        "Erro ao buscar jogos por DLC",
      );
    });
  });

  describe("getGameDetails", () => {
    it("deve retornar detalhes completos de um jogo", async () => {
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

      expect(game.id).toBe(60);
      expect(game.name).toBe("Elden Ring");
      expect(game.genres).toContain("Action RPG");
      expect(game.dlcs).toHaveLength(1);
      expect(game.dlcs[0].name).toBe("Shadow of the Erdtree");
    });

    it("deve lançar erro ao falhar", async () => {
      mockAxiosGet.mockRejectedValue(new Error("API Error"));

      await expect(gameService.getGameDetails(999)).rejects.toThrow(
        "Erro ao buscar detalhes do jogo",
      );
    });
  });

  describe("likeGame", () => {
    it("deve curtir um jogo quando ainda não curtido", async () => {
      const mockGame: Game = { id: "game-uuid", gameId: "123" };

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
      const mockGame: Game = { id: "game-uuid", gameId: "123" };
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
      const mockGame: Game = { id: "game-uuid", gameId: "123" };

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
        "Erro ao curtir jogo",
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
        new Error("Database Error"),
      );

      await expect(gameService.getUserLikedGames("user-123")).rejects.toThrow(
        "Erro ao buscar jogos curtidos",
      );
    });
  });

  describe("setGameStatus", () => {
    it("deve definir status para um novo jogo", async () => {
      const mockGame: Game = { id: "game-uuid", gameId: "123" };

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
        "PLAYING",
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
      const mockGame: Game = { id: "game-uuid", gameId: "123" };
      const mockExistingStatus = {
        id: "status-uuid",
        userId: "user-123",
        gameId: mockGame.id,
        status: "PLAYING",
      };

      prismaMock.game.findUnique.mockResolvedValue(mockGame);
      prismaMock.userGameStatus.findUnique.mockResolvedValue(
        mockExistingStatus,
      );
      prismaMock.userGameStatus.update.mockResolvedValue({
        ...mockExistingStatus,
        status: "COMPLETED",
      });

      const result = await gameService.setGameStatus(
        "user-123",
        "123",
        "COMPLETED",
      );

      expect(prismaMock.userGameStatus.update).toHaveBeenCalledWith({
        where: { id: mockExistingStatus.id },
        data: { status: "COMPLETED" },
      });
      expect(result.message).toBe("Status do jogo atualizado com sucesso");
      expect(result.status).toBe("COMPLETED");
    });

    it("deve criar jogo no banco se não existir", async () => {
      const mockGame: Game = { id: "game-uuid", gameId: "123" };

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
        gameService.setGameStatus("user-123", "123", "PLAYING"),
      ).rejects.toThrow("Erro ao definir status do jogo");
    });
  });

  describe("removeGameStatus", () => {
    it("deve remover status do jogo", async () => {
      const mockGame: Game = { id: "game-uuid", gameId: "123" };

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
        gameService.removeGameStatus("user-123", "123"),
      ).rejects.toThrow("Erro ao remover status do jogo");
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.game.findUnique.mockRejectedValue(new Error("Database Error"));

      await expect(
        gameService.removeGameStatus("user-123", "123"),
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
        "PLAYING",
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
        "COMPLETED",
      );

      expect(games).toHaveLength(0);
    });

    it("deve lançar erro ao falhar", async () => {
      prismaMock.userGameStatus.findMany.mockRejectedValue(
        new Error("Database Error"),
      );

      await expect(
        gameService.getUserGamesByStatus("user-123", "PLAYING"),
      ).rejects.toThrow("Erro ao buscar jogos por status");
    });
  });
});
