import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ListService } from "../../services/list.service";
import { UserService } from "../../services/user.service";
import { List } from "../../models/list.model";
import prisma from "../../lib/prisma";

describe("ListService - Testes de Integração", () => {
  let listService: ListService;
  let userService: UserService;
  let testUserId: string;
  const testListIds: string[] = [];
  const testGameIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();

    userService = new UserService();
    const user = await userService.createUser(
      `list-test-${Date.now()}@example.com`,
      "List Test User",
      "password123"
    );
    testUserId = user.id;
    createdUserIds.push(user.id);
  });

  afterAll(async () => {
    if (testListIds.length > 0) {
      await prisma.listGame.deleteMany({
        where: { listId: { in: testListIds } },
      });
      await prisma.list.deleteMany({
        where: { id: { in: testListIds } },
      });
    }

    if (testGameIds.length > 0) {
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
    listService = new ListService();
  });

  describe("createList", () => {
    it("deve criar uma nova lista no banco de dados", async () => {
      const listName = `Test List ${Date.now()}`;

      const list: List = await listService.createList(listName, testUserId);

      testListIds.push(list.id);

      expect(list).toBeDefined();
      expect(list.id).toBeDefined();
      expect(list.name).toBe(listName);
      expect(list.userId).toBe(testUserId);
      expect(list.isPublic).toBe(false);
      expect(list.createdAt).toBeInstanceOf(Date);
    });

    it("deve criar lista com isPublic false por padrão", async () => {
      const list: List = await listService.createList(
        "Private List",
        testUserId
      );

      testListIds.push(list.id);

      expect(list.isPublic).toBe(false);
    });
  });

  describe("getListsByUserId", () => {
    it("deve retornar todas as listas do usuário", async () => {
      const list1: List = await listService.createList(
        `User List 1 ${Date.now()}`,
        testUserId
      );
      const list2: List = await listService.createList(
        `User List 2 ${Date.now()}`,
        testUserId
      );

      testListIds.push(list1.id, list2.id);

      const lists: List[] = await listService.getListsByUserId(testUserId);

      expect(lists).toBeDefined();
      expect(Array.isArray(lists)).toBe(true);
      expect(lists.length).toBeGreaterThanOrEqual(2);

      const listIds = lists.map((l) => l.id);
      expect(listIds).toContain(list1.id);
      expect(listIds).toContain(list2.id);
    });

    it("deve retornar array vazio quando usuário não tem listas", async () => {
      const newUser = await userService.createUser(
        `no-lists-${Date.now()}@example.com`,
        "No Lists User",
        "password123"
      );
      createdUserIds.push(newUser.id);

      const lists: List[] = await listService.getListsByUserId(newUser.id);

      expect(lists).toBeDefined();
      expect(Array.isArray(lists)).toBe(true);
      expect(lists).toHaveLength(0);
    });
  });

  describe("getListById", () => {
    it("deve retornar lista específica do usuário", async () => {
      const createdList: List = await listService.createList(
        `Get By Id ${Date.now()}`,
        testUserId
      );
      testListIds.push(createdList.id);

      const list: List | null = await listService.getListById(
        createdList.id,
        testUserId
      );

      expect(list).toBeDefined();
      expect(list?.id).toBe(createdList.id);
      expect(list?.name).toBe(createdList.name);
      expect(list?.userId).toBe(testUserId);
    });

    it("deve retornar null para lista inexistente", async () => {
      const list: List | null = await listService.getListById(
        "non-existent-id",
        testUserId
      );

      expect(list).toBeNull();
    });

    it("deve retornar null se lista pertence a outro usuário", async () => {
      const otherUser = await userService.createUser(
        `other-user-${Date.now()}@example.com`,
        "Other User",
        "password123"
      );
      createdUserIds.push(otherUser.id);

      const otherUserList: List = await listService.createList(
        "Other User List",
        otherUser.id
      );
      testListIds.push(otherUserList.id);

      const list: List | null = await listService.getListById(
        otherUserList.id,
        testUserId
      );

      expect(list).toBeNull();
    });
  });

  describe("renameList", () => {
    it("deve renomear uma lista existente", async () => {
      const list: List = await listService.createList(
        "Original Name",
        testUserId
      );
      testListIds.push(list.id);

      const newName = `Renamed List ${Date.now()}`;
      const renamedList: List = await listService.renameList(
        list.id,
        testUserId,
        newName
      );

      expect(renamedList).toBeDefined();
      expect(renamedList.id).toBe(list.id);
      expect(renamedList.name).toBe(newName);
      expect(renamedList.updatedAt).toBeInstanceOf(Date);
    });

    it("deve lançar erro ao renomear lista de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `rename-other-${Date.now()}@example.com`,
        "Rename Other User",
        "password123"
      );
      createdUserIds.push(otherUser.id);

      const otherUserList: List = await listService.createList(
        "Other List",
        otherUser.id
      );
      testListIds.push(otherUserList.id);

      await expect(
        listService.renameList(otherUserList.id, testUserId, "New Name")
      ).rejects.toThrow();
    });
  });

  describe("deleteList", () => {
    it("deve deletar uma lista existente", async () => {
      const list: List = await listService.createList(
        `To Delete ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      await listService.deleteList(list.id, testUserId);

      const deletedList = await prisma.list.findUnique({
        where: { id: list.id },
      });

      expect(deletedList).toBeNull();
    });

    it("deve lançar erro ao deletar lista de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `delete-other-${Date.now()}@example.com`,
        "Delete Other User",
        "password123"
      );
      createdUserIds.push(otherUser.id);

      const otherUserList: List = await listService.createList(
        "Other List",
        otherUser.id
      );
      testListIds.push(otherUserList.id);

      await expect(
        listService.deleteList(otherUserList.id, testUserId)
      ).rejects.toThrow();
    });
  });

  describe("addGameToList", () => {
    it("deve adicionar um jogo à lista", async () => {
      const list: List = await listService.createList(
        `Game List ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      const gameId = "12345";

      await listService.addGameToList(list.id, testUserId, gameId);

      const updatedList: List | null = await listService.getListById(
        list.id,
        testUserId
      );

      expect(updatedList).toBeDefined();
      expect(updatedList?.listGames).toBeDefined();
      expect(updatedList?.listGames?.length).toBeGreaterThan(0);

      const game = await prisma.game.findUnique({ where: { gameId } });
      if (game) {
        testGameIds.push(game.id);
      }

      const addedGame = updatedList?.listGames?.find(
        (lg) => lg.game.gameId === gameId
      );
      expect(addedGame).toBeDefined();
    });

    it("deve criar jogo no banco se não existir ao adicionar à lista", async () => {
      const list: List = await listService.createList(
        `New Game List ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      const newGameId = `new-game-${Date.now()}`;

      let game = await prisma.game.findUnique({ where: { gameId: newGameId } });
      expect(game).toBeNull();

      await listService.addGameToList(list.id, testUserId, newGameId);

      game = await prisma.game.findUnique({ where: { gameId: newGameId } });
      expect(game).toBeDefined();
      if (game) {
        testGameIds.push(game.id);
      }
    });

    it("não deve adicionar jogo duplicado à lista", async () => {
      const list: List = await listService.createList(
        `Duplicate Game List ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      const gameId = "99999";

      await listService.addGameToList(list.id, testUserId, gameId);

      const game = await prisma.game.findUnique({ where: { gameId } });
      if (game) {
        testGameIds.push(game.id);
      }

      await expect(
        listService.addGameToList(list.id, testUserId, gameId)
      ).rejects.toThrow();
    });
  });

  describe("removeGameFromList", () => {
    it("deve remover um jogo da lista", async () => {
      const list: List = await listService.createList(
        `Remove Game List ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      const gameId = "54321";

      await listService.addGameToList(list.id, testUserId, gameId);

      const game = await prisma.game.findUnique({ where: { gameId } });
      if (game) {
        testGameIds.push(game.id);
      }

      await listService.removeGameFromList(list.id, testUserId, gameId);

      const updatedList: List | null = await listService.getListById(
        list.id,
        testUserId
      );

      expect(updatedList).toBeDefined();

      const removedGame = updatedList?.listGames?.find(
        (lg) => lg.game.gameId === gameId
      );
      expect(removedGame).toBeUndefined();
    });

    it("deve lançar erro ao remover jogo de lista de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `remove-game-other-${Date.now()}@example.com`,
        "Remove Game Other User",
        "password123"
      );
      createdUserIds.push(otherUser.id);

      const otherUserList: List = await listService.createList(
        "Other List",
        otherUser.id
      );
      testListIds.push(otherUserList.id);

      await expect(
        listService.removeGameFromList(otherUserList.id, testUserId, "12345")
      ).rejects.toThrow();
    });
  });

  describe("makeListPublic", () => {
    it("deve tornar uma lista pública", async () => {
      const list: List = await listService.createList(
        `Public List ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      expect(list.isPublic).toBe(false);

      const publicList: List = await listService.makeListPublic(
        list.id,
        testUserId
      );

      expect(publicList).toBeDefined();
      expect(publicList.id).toBe(list.id);
      expect(publicList.isPublic).toBe(true);
    });

    it("deve lançar erro ao tornar pública lista de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `public-other-${Date.now()}@example.com`,
        "Public Other User",
        "password123"
      );
      createdUserIds.push(otherUser.id);

      const otherUserList: List = await listService.createList(
        "Other List",
        otherUser.id
      );
      testListIds.push(otherUserList.id);

      await expect(
        listService.makeListPublic(otherUserList.id, testUserId)
      ).rejects.toThrow();
    });
  });

  describe("makeListPrivate", () => {
    it("deve tornar uma lista privada", async () => {
      const list: List = await listService.createList(
        `Private List ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      await listService.makeListPublic(list.id, testUserId);

      const privateList: List = await listService.makeListPrivate(
        list.id,
        testUserId
      );

      expect(privateList).toBeDefined();
      expect(privateList.id).toBe(list.id);
      expect(privateList.isPublic).toBe(false);
    });

    it("deve lançar erro ao tornar privada lista de outro usuário", async () => {
      const otherUser = await userService.createUser(
        `private-other-${Date.now()}@example.com`,
        "Private Other User",
        "password123"
      );
      createdUserIds.push(otherUser.id);

      const otherUserList: List = await listService.createList(
        "Other List",
        otherUser.id
      );
      testListIds.push(otherUserList.id);

      await expect(
        listService.makeListPrivate(otherUserList.id, testUserId)
      ).rejects.toThrow();
    });
  });

  describe("Fluxo completo de operações de lista", () => {
    it("deve executar ciclo completo: criar, adicionar jogos, renomear, tornar pública, remover jogo, deletar", async () => {
      const list: List = await listService.createList(
        `Full Flow ${Date.now()}`,
        testUserId
      );
      testListIds.push(list.id);

      expect(list.isPublic).toBe(false);

      const gameId1 = "111111";
      const gameId2 = "222222";

      await listService.addGameToList(list.id, testUserId, gameId1);

      let updatedList: List | null = await listService.getListById(
        list.id,
        testUserId
      );
      expect(updatedList?.listGames?.length).toBeGreaterThan(0);

      await listService.addGameToList(list.id, testUserId, gameId2);

      updatedList = await listService.getListById(list.id, testUserId);
      expect(updatedList?.listGames?.length).toBeGreaterThanOrEqual(2);

      const game1 = await prisma.game.findUnique({
        where: { gameId: gameId1 },
      });
      const game2 = await prisma.game.findUnique({
        where: { gameId: gameId2 },
      });
      if (game1) testGameIds.push(game1.id);
      if (game2) testGameIds.push(game2.id);

      const renamedList: List = await listService.renameList(
        list.id,
        testUserId,
        "Renamed Full Flow"
      );
      expect(renamedList.name).toBe("Renamed Full Flow");

      const publicList: List = await listService.makeListPublic(
        list.id,
        testUserId
      );
      expect(publicList.isPublic).toBe(true);

      await listService.removeGameFromList(list.id, testUserId, gameId1);

      const listAfterRemove: List | null = await listService.getListById(
        list.id,
        testUserId
      );
      const hasGame1 = listAfterRemove?.listGames?.some(
        (lg) => lg.game.gameId === gameId1
      );
      expect(hasGame1).toBe(false);

      await listService.deleteList(list.id, testUserId);

      const deletedList = await prisma.list.findUnique({
        where: { id: list.id },
      });
      expect(deletedList).toBeNull();
    });
  });
});
