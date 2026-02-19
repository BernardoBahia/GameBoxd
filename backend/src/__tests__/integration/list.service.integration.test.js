"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const list_service_1 = require("../../services/list.service");
const user_service_1 = require("../../services/user.service");
const prisma_1 = __importDefault(require("../../lib/prisma"));
(0, vitest_1.describe)("ListService - Testes de Integração", () => {
    let listService;
    let userService;
    let testUserId;
    const testListIds = [];
    const testGameIds = [];
    const createdUserIds = [];
    (0, vitest_1.beforeAll)(async () => {
        await prisma_1.default.$connect();
        userService = new user_service_1.UserService();
        const user = await userService.createUser(`list-test-${Date.now()}@example.com`, "List Test User", "password123");
        testUserId = user.id;
        createdUserIds.push(user.id);
    });
    (0, vitest_1.afterAll)(async () => {
        if (testListIds.length > 0) {
            await prisma_1.default.listGame.deleteMany({
                where: { listId: { in: testListIds } },
            });
            await prisma_1.default.list.deleteMany({
                where: { id: { in: testListIds } },
            });
        }
        if (testGameIds.length > 0) {
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
        listService = new list_service_1.ListService();
    });
    (0, vitest_1.describe)("createList", () => {
        (0, vitest_1.it)("deve criar uma nova lista no banco de dados", async () => {
            const listName = `Test List ${Date.now()}`;
            const list = await listService.createList(listName, testUserId);
            testListIds.push(list.id);
            (0, vitest_1.expect)(list).toBeDefined();
            (0, vitest_1.expect)(list.id).toBeDefined();
            (0, vitest_1.expect)(list.name).toBe(listName);
            (0, vitest_1.expect)(list.userId).toBe(testUserId);
            (0, vitest_1.expect)(list.isPublic).toBe(false);
            (0, vitest_1.expect)(list.createdAt).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)("deve criar lista com isPublic false por padrão", async () => {
            const list = await listService.createList("Private List", testUserId);
            testListIds.push(list.id);
            (0, vitest_1.expect)(list.isPublic).toBe(false);
        });
    });
    (0, vitest_1.describe)("getListsByUserId", () => {
        (0, vitest_1.it)("deve retornar todas as listas do usuário", async () => {
            const list1 = await listService.createList(`User List 1 ${Date.now()}`, testUserId);
            const list2 = await listService.createList(`User List 2 ${Date.now()}`, testUserId);
            testListIds.push(list1.id, list2.id);
            const lists = await listService.getListsByUserId(testUserId);
            (0, vitest_1.expect)(lists).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(lists)).toBe(true);
            (0, vitest_1.expect)(lists.length).toBeGreaterThanOrEqual(2);
            const listIds = lists.map((l) => l.id);
            (0, vitest_1.expect)(listIds).toContain(list1.id);
            (0, vitest_1.expect)(listIds).toContain(list2.id);
        });
        (0, vitest_1.it)("deve retornar array vazio quando usuário não tem listas", async () => {
            const newUser = await userService.createUser(`no-lists-${Date.now()}@example.com`, "No Lists User", "password123");
            createdUserIds.push(newUser.id);
            const lists = await listService.getListsByUserId(newUser.id);
            (0, vitest_1.expect)(lists).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(lists)).toBe(true);
            (0, vitest_1.expect)(lists).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)("getListById", () => {
        (0, vitest_1.it)("deve retornar lista específica do usuário", async () => {
            const createdList = await listService.createList(`Get By Id ${Date.now()}`, testUserId);
            testListIds.push(createdList.id);
            const list = await listService.getListById(createdList.id, testUserId);
            (0, vitest_1.expect)(list).toBeDefined();
            (0, vitest_1.expect)(list?.id).toBe(createdList.id);
            (0, vitest_1.expect)(list?.name).toBe(createdList.name);
            (0, vitest_1.expect)(list?.userId).toBe(testUserId);
        });
        (0, vitest_1.it)("deve retornar null para lista inexistente", async () => {
            const list = await listService.getListById("non-existent-id", testUserId);
            (0, vitest_1.expect)(list).toBeNull();
        });
        (0, vitest_1.it)("deve retornar null se lista pertence a outro usuário", async () => {
            const otherUser = await userService.createUser(`other-user-${Date.now()}@example.com`, "Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherUserList = await listService.createList("Other User List", otherUser.id);
            testListIds.push(otherUserList.id);
            const list = await listService.getListById(otherUserList.id, testUserId);
            (0, vitest_1.expect)(list).toBeNull();
        });
    });
    (0, vitest_1.describe)("renameList", () => {
        (0, vitest_1.it)("deve renomear uma lista existente", async () => {
            const list = await listService.createList("Original Name", testUserId);
            testListIds.push(list.id);
            const newName = `Renamed List ${Date.now()}`;
            const renamedList = await listService.renameList(list.id, testUserId, newName);
            (0, vitest_1.expect)(renamedList).toBeDefined();
            (0, vitest_1.expect)(renamedList.id).toBe(list.id);
            (0, vitest_1.expect)(renamedList.name).toBe(newName);
            (0, vitest_1.expect)(renamedList.updatedAt).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)("deve lançar erro ao renomear lista de outro usuário", async () => {
            const otherUser = await userService.createUser(`rename-other-${Date.now()}@example.com`, "Rename Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherUserList = await listService.createList("Other List", otherUser.id);
            testListIds.push(otherUserList.id);
            await (0, vitest_1.expect)(listService.renameList(otherUserList.id, testUserId, "New Name")).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("deleteList", () => {
        (0, vitest_1.it)("deve deletar uma lista existente", async () => {
            const list = await listService.createList(`To Delete ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            await listService.deleteList(list.id, testUserId);
            const deletedList = await prisma_1.default.list.findUnique({
                where: { id: list.id },
            });
            (0, vitest_1.expect)(deletedList).toBeNull();
        });
        (0, vitest_1.it)("deve lançar erro ao deletar lista de outro usuário", async () => {
            const otherUser = await userService.createUser(`delete-other-${Date.now()}@example.com`, "Delete Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherUserList = await listService.createList("Other List", otherUser.id);
            testListIds.push(otherUserList.id);
            await (0, vitest_1.expect)(listService.deleteList(otherUserList.id, testUserId)).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("addGameToList", () => {
        (0, vitest_1.it)("deve adicionar um jogo à lista", async () => {
            const list = await listService.createList(`Game List ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            const gameId = "12345";
            await listService.addGameToList(list.id, testUserId, gameId);
            const updatedList = await listService.getListById(list.id, testUserId);
            (0, vitest_1.expect)(updatedList).toBeDefined();
            (0, vitest_1.expect)(updatedList?.listGames).toBeDefined();
            (0, vitest_1.expect)(updatedList?.listGames?.length).toBeGreaterThan(0);
            const game = await prisma_1.default.game.findUnique({ where: { gameId } });
            if (game) {
                testGameIds.push(game.id);
            }
            const addedGame = updatedList?.listGames?.find((lg) => lg.game.gameId === gameId);
            (0, vitest_1.expect)(addedGame).toBeDefined();
        });
        (0, vitest_1.it)("deve criar jogo no banco se não existir ao adicionar à lista", async () => {
            const list = await listService.createList(`New Game List ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            const newGameId = `new-game-${Date.now()}`;
            let game = await prisma_1.default.game.findUnique({ where: { gameId: newGameId } });
            (0, vitest_1.expect)(game).toBeNull();
            await listService.addGameToList(list.id, testUserId, newGameId);
            game = await prisma_1.default.game.findUnique({ where: { gameId: newGameId } });
            (0, vitest_1.expect)(game).toBeDefined();
            if (game) {
                testGameIds.push(game.id);
            }
        });
        (0, vitest_1.it)("não deve adicionar jogo duplicado à lista", async () => {
            const list = await listService.createList(`Duplicate Game List ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            const gameId = "99999";
            await listService.addGameToList(list.id, testUserId, gameId);
            const game = await prisma_1.default.game.findUnique({ where: { gameId } });
            if (game) {
                testGameIds.push(game.id);
            }
            await (0, vitest_1.expect)(listService.addGameToList(list.id, testUserId, gameId)).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("removeGameFromList", () => {
        (0, vitest_1.it)("deve remover um jogo da lista", async () => {
            const list = await listService.createList(`Remove Game List ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            const gameId = "54321";
            await listService.addGameToList(list.id, testUserId, gameId);
            const game = await prisma_1.default.game.findUnique({ where: { gameId } });
            if (game) {
                testGameIds.push(game.id);
            }
            await listService.removeGameFromList(list.id, testUserId, gameId);
            const updatedList = await listService.getListById(list.id, testUserId);
            (0, vitest_1.expect)(updatedList).toBeDefined();
            const removedGame = updatedList?.listGames?.find((lg) => lg.game.gameId === gameId);
            (0, vitest_1.expect)(removedGame).toBeUndefined();
        });
        (0, vitest_1.it)("deve lançar erro ao remover jogo de lista de outro usuário", async () => {
            const otherUser = await userService.createUser(`remove-game-other-${Date.now()}@example.com`, "Remove Game Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherUserList = await listService.createList("Other List", otherUser.id);
            testListIds.push(otherUserList.id);
            await (0, vitest_1.expect)(listService.removeGameFromList(otherUserList.id, testUserId, "12345")).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("makeListPublic", () => {
        (0, vitest_1.it)("deve tornar uma lista pública", async () => {
            const list = await listService.createList(`Public List ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            (0, vitest_1.expect)(list.isPublic).toBe(false);
            const publicList = await listService.makeListPublic(list.id, testUserId);
            (0, vitest_1.expect)(publicList).toBeDefined();
            (0, vitest_1.expect)(publicList.id).toBe(list.id);
            (0, vitest_1.expect)(publicList.isPublic).toBe(true);
        });
        (0, vitest_1.it)("deve lançar erro ao tornar pública lista de outro usuário", async () => {
            const otherUser = await userService.createUser(`public-other-${Date.now()}@example.com`, "Public Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherUserList = await listService.createList("Other List", otherUser.id);
            testListIds.push(otherUserList.id);
            await (0, vitest_1.expect)(listService.makeListPublic(otherUserList.id, testUserId)).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("makeListPrivate", () => {
        (0, vitest_1.it)("deve tornar uma lista privada", async () => {
            const list = await listService.createList(`Private List ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            await listService.makeListPublic(list.id, testUserId);
            const privateList = await listService.makeListPrivate(list.id, testUserId);
            (0, vitest_1.expect)(privateList).toBeDefined();
            (0, vitest_1.expect)(privateList.id).toBe(list.id);
            (0, vitest_1.expect)(privateList.isPublic).toBe(false);
        });
        (0, vitest_1.it)("deve lançar erro ao tornar privada lista de outro usuário", async () => {
            const otherUser = await userService.createUser(`private-other-${Date.now()}@example.com`, "Private Other User", "password123");
            createdUserIds.push(otherUser.id);
            const otherUserList = await listService.createList("Other List", otherUser.id);
            testListIds.push(otherUserList.id);
            await (0, vitest_1.expect)(listService.makeListPrivate(otherUserList.id, testUserId)).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("Fluxo completo de operações de lista", () => {
        (0, vitest_1.it)("deve executar ciclo completo: criar, adicionar jogos, renomear, tornar pública, remover jogo, deletar", async () => {
            const list = await listService.createList(`Full Flow ${Date.now()}`, testUserId);
            testListIds.push(list.id);
            (0, vitest_1.expect)(list.isPublic).toBe(false);
            const gameId1 = "111111";
            const gameId2 = "222222";
            await listService.addGameToList(list.id, testUserId, gameId1);
            let updatedList = await listService.getListById(list.id, testUserId);
            (0, vitest_1.expect)(updatedList?.listGames?.length).toBeGreaterThan(0);
            await listService.addGameToList(list.id, testUserId, gameId2);
            updatedList = await listService.getListById(list.id, testUserId);
            (0, vitest_1.expect)(updatedList?.listGames?.length).toBeGreaterThanOrEqual(2);
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
            const renamedList = await listService.renameList(list.id, testUserId, "Renamed Full Flow");
            (0, vitest_1.expect)(renamedList.name).toBe("Renamed Full Flow");
            const publicList = await listService.makeListPublic(list.id, testUserId);
            (0, vitest_1.expect)(publicList.isPublic).toBe(true);
            await listService.removeGameFromList(list.id, testUserId, gameId1);
            const listAfterRemove = await listService.getListById(list.id, testUserId);
            const hasGame1 = listAfterRemove?.listGames?.some((lg) => lg.game.gameId === gameId1);
            (0, vitest_1.expect)(hasGame1).toBe(false);
            await listService.deleteList(list.id, testUserId);
            const deletedList = await prisma_1.default.list.findUnique({
                where: { id: list.id },
            });
            (0, vitest_1.expect)(deletedList).toBeNull();
        });
    });
});
