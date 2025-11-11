import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListService } from "../../services/list.service";
import { PrismaClient } from "@prisma/client";
import { List } from "../../models/list.model";

vi.mock("../../services/game.service", () => ({
  GameService: class {
    getGameDetails = vi.fn();
  },
}));

vi.mock("@prisma/client", () => {
  const mockList = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };
  const mockGame = {
    findUnique: vi.fn(),
    create: vi.fn(),
  };
  const mockListGame = {
    create: vi.fn(),
    deleteMany: vi.fn(),
  };

  return {
    PrismaClient: class {
      list = mockList;
      game = mockGame;
      listGame = mockListGame;
    },
  };
});

import type { Mock } from "vitest";

const prisma = new PrismaClient();
const prismaMock = {
  list: prisma.list as unknown as {
    create: Mock;
    findMany: Mock;
    findFirst: Mock;
    update: Mock;
    deleteMany: Mock;
  },
  game: prisma.game as unknown as {
    findUnique: Mock;
    create: Mock;
  },
  listGame: prisma.listGame as unknown as {
    create: Mock;
    deleteMany: Mock;
  },
};

describe("ListService", () => {
  let listService: ListService;

  beforeEach(() => {
    vi.clearAllMocks();
    listService = new ListService();
  });

  describe("createList", () => {
    it("deve criar uma nova lista com sucesso", async () => {
      const listData = {
        name: "Meus Jogos Favoritos",
        userId: "user-123",
      };

      const mockPrismaList = {
        id: "list-1",
        name: listData.name,
        userId: listData.userId,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      prismaMock.list.create.mockResolvedValue(mockPrismaList);

      const list: List = await listService.createList(
        listData.name,
        listData.userId
      );

      expect(prismaMock.list.create).toHaveBeenCalledWith({
        data: {
          name: listData.name,
          userId: listData.userId,
        },
      });
      expect(list.name).toBe(listData.name);
      expect(list.userId).toBe(listData.userId);
      expect(list.isPublic).toBe(false);
    });

    it("deve lançar erro ao falhar na criação", async () => {
      prismaMock.list.create.mockRejectedValue(new Error("Database error"));

      await expect(
        listService.createList("Test List", "user-123")
      ).rejects.toThrow("Falha ao criar lista");
    });
  });

  describe("deleteList", () => {
    it("deve deletar uma lista com sucesso", async () => {
      const listId = "list-1";
      const userId = "user-123";

      prismaMock.list.deleteMany.mockResolvedValue({ count: 1 });

      await listService.deleteList(listId, userId);

      expect(prismaMock.list.deleteMany).toHaveBeenCalledWith({
        where: {
          id: listId,
          userId,
        },
      });
    });

    it("deve lançar erro ao falhar na exclusão", async () => {
      prismaMock.list.deleteMany.mockRejectedValue(new Error("Database error"));

      await expect(
        listService.deleteList("list-1", "user-123")
      ).rejects.toThrow("Falha ao deletar lista");
    });
  });

  describe("renameList", () => {
    it("deve renomear uma lista com sucesso", async () => {
      const listId = "list-1";
      const userId = "user-123";
      const newName = "Novo Nome da Lista";

      const mockExistingList = {
        id: listId,
        name: "Nome Antigo",
        userId,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      const mockRenamedList = {
        ...mockExistingList,
        name: newName,
        updatedAt: new Date(),
      };

      prismaMock.list.findFirst.mockResolvedValue(mockExistingList);
      prismaMock.list.update.mockResolvedValue(mockRenamedList);

      const list: List = await listService.renameList(listId, userId, newName);

      expect(prismaMock.list.findFirst).toHaveBeenCalledWith({
        where: {
          id: listId,
          userId,
        },
      });
      expect(prismaMock.list.update).toHaveBeenCalledWith({
        where: { id: listId },
        data: {
          name: newName,
        },
      });
      expect(list.name).toBe(newName);
    });

    it("deve lançar erro quando lista não existe", async () => {
      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(
        listService.renameList("list-1", "user-123", "Novo Nome")
      ).rejects.toThrow("Lista não encontrada ou sem permissão para editar");
    });

    it("deve lançar erro ao falhar na atualização", async () => {
      const mockExistingList = {
        id: "list-1",
        name: "Nome Antigo",
        userId: "user-123",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      prismaMock.list.findFirst.mockResolvedValue(mockExistingList);
      prismaMock.list.update.mockRejectedValue(new Error("Database error"));

      await expect(
        listService.renameList("list-1", "user-123", "Novo Nome")
      ).rejects.toThrow("Falha ao renomear lista");
    });
  });

  describe("makeListPublic", () => {
    it("deve tornar uma lista pública com sucesso", async () => {
      const listId = "list-1";
      const userId = "user-123";

      const mockExistingList = {
        id: listId,
        name: "Minha Lista",
        userId,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      const mockUpdatedList = {
        ...mockExistingList,
        isPublic: true,
        updatedAt: new Date(),
      };

      prismaMock.list.findFirst.mockResolvedValue(mockExistingList);
      prismaMock.list.update.mockResolvedValue(mockUpdatedList);

      const list: List = await listService.makeListPublic(listId, userId);

      expect(prismaMock.list.findFirst).toHaveBeenCalledWith({
        where: {
          id: listId,
          userId,
        },
      });
      expect(prismaMock.list.update).toHaveBeenCalledWith({
        where: { id: listId },
        data: {
          isPublic: true,
        },
      });
      expect(list.isPublic).toBe(true);
    });

    it("deve lançar erro quando lista não existe", async () => {
      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(
        listService.makeListPublic("list-1", "user-123")
      ).rejects.toThrow("Lista não encontrada ou sem permissão para editar");
    });

    it("deve lançar erro ao falhar na atualização", async () => {
      const mockExistingList = {
        id: "list-1",
        name: "Minha Lista",
        userId: "user-123",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      prismaMock.list.findFirst.mockResolvedValue(mockExistingList);
      prismaMock.list.update.mockRejectedValue(new Error("Database error"));

      await expect(
        listService.makeListPublic("list-1", "user-123")
      ).rejects.toThrow("Falha ao tornar lista pública");
    });
  });

  describe("makeListPrivate", () => {
    it("deve tornar uma lista privada com sucesso", async () => {
      const listId = "list-1";
      const userId = "user-123";

      const mockExistingList = {
        id: listId,
        name: "Minha Lista",
        userId,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      const mockUpdatedList = {
        ...mockExistingList,
        isPublic: false,
        updatedAt: new Date(),
      };

      prismaMock.list.findFirst.mockResolvedValue(mockExistingList);
      prismaMock.list.update.mockResolvedValue(mockUpdatedList);

      const list: List = await listService.makeListPrivate(listId, userId);

      expect(prismaMock.list.findFirst).toHaveBeenCalledWith({
        where: {
          id: listId,
          userId,
        },
      });
      expect(prismaMock.list.update).toHaveBeenCalledWith({
        where: { id: listId },
        data: {
          isPublic: false,
        },
      });
      expect(list.isPublic).toBe(false);
    });

    it("deve lançar erro quando lista não existe", async () => {
      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(
        listService.makeListPrivate("list-1", "user-123")
      ).rejects.toThrow("Lista não encontrada ou sem permissão para editar");
    });

    it("deve lançar erro ao falhar na atualização", async () => {
      const mockExistingList = {
        id: "list-1",
        name: "Minha Lista",
        userId: "user-123",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      prismaMock.list.findFirst.mockResolvedValue(mockExistingList);
      prismaMock.list.update.mockRejectedValue(new Error("Database error"));

      await expect(
        listService.makeListPrivate("list-1", "user-123")
      ).rejects.toThrow("Falha ao tornar lista privada");
    });
  });
});
