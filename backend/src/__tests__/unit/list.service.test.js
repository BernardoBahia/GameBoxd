"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_1 = require("@prisma/client");
const list_service_1 = require("../../services/list.service");
vitest_1.vi.mock("../../services/game.service", () => ({
    GameService: class {
        getGameDetails = vitest_1.vi.fn();
    },
}));
vitest_1.vi.mock("@prisma/client", () => {
    const mockList = {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findFirst: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        deleteMany: vitest_1.vi.fn(),
    };
    const mockGame = {
        findUnique: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
    };
    const mockListGame = {
        create: vitest_1.vi.fn(),
        deleteMany: vitest_1.vi.fn(),
    };
    return {
        PrismaClient: class {
            list = mockList;
            game = mockGame;
            listGame = mockListGame;
        },
    };
});
const prisma = new client_1.PrismaClient();
const prismaMock = {
    list: prisma.list,
    game: prisma.game,
    listGame: prisma.listGame,
};
(0, vitest_1.describe)("ListService", () => {
    let listService;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        listService = new list_service_1.ListService();
    });
    (0, vitest_1.describe)("createList", () => {
        (0, vitest_1.it)("deve criar uma nova lista com sucesso", async () => {
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
            const list = await listService.createList(listData.name, listData.userId);
            (0, vitest_1.expect)(prismaMock.list.create).toHaveBeenCalledWith({
                data: {
                    name: listData.name,
                    userId: listData.userId,
                },
            });
            (0, vitest_1.expect)(list.name).toBe(listData.name);
            (0, vitest_1.expect)(list.userId).toBe(listData.userId);
            (0, vitest_1.expect)(list.isPublic).toBe(false);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na criação", async () => {
            prismaMock.list.create.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(listService.createList("Test List", "user-123")).rejects.toThrow("Falha ao criar lista");
        });
    });
    (0, vitest_1.describe)("deleteList", () => {
        (0, vitest_1.it)("deve deletar uma lista com sucesso", async () => {
            const listId = "list-1";
            const userId = "user-123";
            prismaMock.list.deleteMany.mockResolvedValue({ count: 1 });
            await listService.deleteList(listId, userId);
            (0, vitest_1.expect)(prismaMock.list.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: listId,
                    userId,
                },
            });
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na exclusão", async () => {
            prismaMock.list.deleteMany.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(listService.deleteList("list-1", "user-123")).rejects.toThrow("Falha ao deletar lista");
        });
    });
    (0, vitest_1.describe)("renameList", () => {
        (0, vitest_1.it)("deve renomear uma lista com sucesso", async () => {
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
            const list = await listService.renameList(listId, userId, newName);
            (0, vitest_1.expect)(prismaMock.list.findFirst).toHaveBeenCalledWith({
                where: {
                    id: listId,
                    userId,
                },
            });
            (0, vitest_1.expect)(prismaMock.list.update).toHaveBeenCalledWith({
                where: { id: listId },
                data: {
                    name: newName,
                },
            });
            (0, vitest_1.expect)(list.name).toBe(newName);
        });
        (0, vitest_1.it)("deve lançar erro quando lista não existe", async () => {
            prismaMock.list.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(listService.renameList("list-1", "user-123", "Novo Nome")).rejects.toThrow("Lista não encontrada ou sem permissão para editar");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na atualização", async () => {
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
            await (0, vitest_1.expect)(listService.renameList("list-1", "user-123", "Novo Nome")).rejects.toThrow("Falha ao renomear lista");
        });
    });
    (0, vitest_1.describe)("makeListPublic", () => {
        (0, vitest_1.it)("deve tornar uma lista pública com sucesso", async () => {
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
            const list = await listService.makeListPublic(listId, userId);
            (0, vitest_1.expect)(prismaMock.list.findFirst).toHaveBeenCalledWith({
                where: {
                    id: listId,
                    userId,
                },
            });
            (0, vitest_1.expect)(prismaMock.list.update).toHaveBeenCalledWith({
                where: { id: listId },
                data: {
                    isPublic: true,
                },
            });
            (0, vitest_1.expect)(list.isPublic).toBe(true);
        });
        (0, vitest_1.it)("deve lançar erro quando lista não existe", async () => {
            prismaMock.list.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(listService.makeListPublic("list-1", "user-123")).rejects.toThrow("Lista não encontrada ou sem permissão para editar");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na atualização", async () => {
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
            await (0, vitest_1.expect)(listService.makeListPublic("list-1", "user-123")).rejects.toThrow("Falha ao tornar lista pública");
        });
    });
    (0, vitest_1.describe)("makeListPrivate", () => {
        (0, vitest_1.it)("deve tornar uma lista privada com sucesso", async () => {
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
            const list = await listService.makeListPrivate(listId, userId);
            (0, vitest_1.expect)(prismaMock.list.findFirst).toHaveBeenCalledWith({
                where: {
                    id: listId,
                    userId,
                },
            });
            (0, vitest_1.expect)(prismaMock.list.update).toHaveBeenCalledWith({
                where: { id: listId },
                data: {
                    isPublic: false,
                },
            });
            (0, vitest_1.expect)(list.isPublic).toBe(false);
        });
        (0, vitest_1.it)("deve lançar erro quando lista não existe", async () => {
            prismaMock.list.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(listService.makeListPrivate("list-1", "user-123")).rejects.toThrow("Lista não encontrada ou sem permissão para editar");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na atualização", async () => {
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
            await (0, vitest_1.expect)(listService.makeListPrivate("list-1", "user-123")).rejects.toThrow("Falha ao tornar lista privada");
        });
    });
});
