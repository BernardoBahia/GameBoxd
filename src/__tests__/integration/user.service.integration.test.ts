import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user.model";
import prisma from "../../lib/prisma";

describe("UserService - Testes de Integração", () => {
  let userService: UserService;
  const testUsers: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    if (testUsers.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: testUsers,
          },
        },
      });
    }
    await prisma.$disconnect();
  });

  beforeEach(() => {
    userService = new UserService();
  });

  describe("createUser", () => {
    it("deve criar um novo usuário no banco de dados", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        password: "password123",
      };

      const user: User = await userService.createUser(
        userData.email,
        userData.name,
        userData.password
      );

      testUsers.push(user.id);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(userData.password);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(userData.email);
    });

    it("deve criar senha hasheada com bcrypt", async () => {
      const userData = {
        email: `test-hash-${Date.now()}@example.com`,
        name: "Hash Test User",
        password: "mySecretPassword",
      };

      const user: User = await userService.createUser(
        userData.email,
        userData.name,
        userData.password
      );

      testUsers.push(user.id);

      expect(user.passwordHash).toMatch(/^\$2[ab]\$/);
      expect(user.passwordHash).not.toBe(userData.password);
    });

    it("deve lançar erro ao tentar criar usuário com email duplicado", async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      const user1 = await userService.createUser(
        email,
        "First User",
        "password123"
      );
      testUsers.push(user1.id);

      await expect(
        userService.createUser(email, "Second User", "password456")
      ).rejects.toThrow();
    });
  });

  describe("getUserByEmail", () => {
    it("deve buscar usuário existente por email", async () => {
      const email = `find-by-email-${Date.now()}@example.com`;
      const createdUser = await userService.createUser(
        email,
        "Find Me",
        "password123"
      );
      testUsers.push(createdUser.id);

      const foundUser: User | null = await userService.getUserByEmail(email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(email);
      expect(foundUser?.name).toBe("Find Me");
    });

    it("deve retornar null para email inexistente", async () => {
      const user: User | null = await userService.getUserByEmail(
        "nonexistent@example.com"
      );

      expect(user).toBeNull();
    });
  });

  describe("validatePassword", () => {
    it("deve validar senha correta", async () => {
      const password = "correctPassword123";
      const email = `validate-${Date.now()}@example.com`;

      const user = await userService.createUser(
        email,
        "Password Test",
        password
      );
      testUsers.push(user.id);

      const isValid = await userService.validatePassword(
        password,
        user.passwordHash
      );

      expect(isValid).toBe(true);
    });

    it("deve rejeitar senha incorreta", async () => {
      const email = `wrong-password-${Date.now()}@example.com`;
      const user = await userService.createUser(
        email,
        "Password Test",
        "correctPassword"
      );
      testUsers.push(user.id);

      const isValid = await userService.validatePassword(
        "wrongPassword",
        user.passwordHash
      );

      expect(isValid).toBe(false);
    });
  });

  describe("getAllUsers", () => {
    it("deve retornar lista de usuários", async () => {
      const user1 = await userService.createUser(
        `list-1-${Date.now()}@example.com`,
        "User 1",
        "password1"
      );
      const user2 = await userService.createUser(
        `list-2-${Date.now()}@example.com`,
        "User 2",
        "password2"
      );

      testUsers.push(user1.id, user2.id);

      const users: User[] = await userService.getAllUsers();

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(2);

      const userIds = users.map((u) => u.id);
      expect(userIds).toContain(user1.id);
      expect(userIds).toContain(user2.id);
    });
  });

  describe("getUserById", () => {
    it("deve buscar usuário por ID", async () => {
      const email = `find-by-id-${Date.now()}@example.com`;
      const createdUser = await userService.createUser(
        email,
        "Find By ID",
        "password123"
      );
      testUsers.push(createdUser.id);

      const foundUser: User | null = await userService.getUserById(
        createdUser.id
      );

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(email);
      expect(foundUser?.name).toBe("Find By ID");
    });

    it("deve retornar null para ID inexistente", async () => {
      const user: User | null = await userService.getUserById(
        "00000000-0000-0000-0000-000000000000"
      );

      expect(user).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("deve atualizar nome do usuário", async () => {
      const email = `update-name-${Date.now()}@example.com`;
      const user = await userService.createUser(
        email,
        "Original Name",
        "password123"
      );
      testUsers.push(user.id);

      const updatedUser: User = await userService.updateUser(user.id, {
        name: "Updated Name",
      });

      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.name).toBe("Updated Name");
      expect(updatedUser.email).toBe(email);

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(dbUser?.name).toBe("Updated Name");
    });

    it("deve atualizar email do usuário", async () => {
      const originalEmail = `update-email-${Date.now()}@example.com`;
      const newEmail = `new-email-${Date.now()}@example.com`;

      const user = await userService.createUser(
        originalEmail,
        "Email Test",
        "password123"
      );
      testUsers.push(user.id);

      const updatedUser: User = await userService.updateUser(user.id, {
        email: newEmail,
      });

      expect(updatedUser.email).toBe(newEmail);

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(dbUser?.email).toBe(newEmail);
    });

    it("deve atualizar senha do usuário e hashear nova senha", async () => {
      const email = `update-password-${Date.now()}@example.com`;
      const oldPassword = "oldPassword123";
      const newPassword = "newPassword456";

      const user = await userService.createUser(
        email,
        "Password Update Test",
        oldPassword
      );
      testUsers.push(user.id);

      const updatedUser: User = await userService.updateUser(user.id, {
        password: newPassword,
      });

      expect(updatedUser.passwordHash).not.toBe(user.passwordHash);

      const isNewPasswordValid = await userService.validatePassword(
        newPassword,
        updatedUser.passwordHash
      );
      expect(isNewPasswordValid).toBe(true);

      const isOldPasswordValid = await userService.validatePassword(
        oldPassword,
        updatedUser.passwordHash
      );
      expect(isOldPasswordValid).toBe(false);
    });

    it("deve atualizar múltiplos campos ao mesmo tempo", async () => {
      const originalEmail = `update-multiple-${Date.now()}@example.com`;
      const newEmail = `new-multiple-${Date.now()}@example.com`;

      const user = await userService.createUser(
        originalEmail,
        "Original Name",
        "password123"
      );
      testUsers.push(user.id);

      const updatedUser: User = await userService.updateUser(user.id, {
        email: newEmail,
        name: "New Name",
        password: "newPassword",
      });

      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.name).toBe("New Name");
      expect(updatedUser.passwordHash).not.toBe(user.passwordHash);

      const isPasswordValid = await userService.validatePassword(
        "newPassword",
        updatedUser.passwordHash
      );
      expect(isPasswordValid).toBe(true);
    });
  });

  describe("deleteUser", () => {
    it("deve deletar usuário do banco de dados", async () => {
      const email = `delete-${Date.now()}@example.com`;
      const user = await userService.createUser(
        email,
        "To Be Deleted",
        "password123"
      );

      const deletedUser: User = await userService.deleteUser(user.id);

      expect(deletedUser.id).toBe(user.id);
      expect(deletedUser.email).toBe(email);

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(dbUser).toBeNull();

      const index = testUsers.indexOf(user.id);
      if (index > -1) {
        testUsers.splice(index, 1);
      }
    });

    it("deve lançar erro ao tentar deletar usuário inexistente", async () => {
      await expect(
        userService.deleteUser("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow();
    });
  });

  describe("Fluxo completo de CRUD", () => {
    it("deve executar operações CRUD completas", async () => {
      const email = `crud-flow-${Date.now()}@example.com`;
      const createdUser = await userService.createUser(
        email,
        "CRUD Test",
        "password123"
      );
      testUsers.push(createdUser.id);

      expect(createdUser.email).toBe(email);

      const foundByEmail = await userService.getUserByEmail(email);
      expect(foundByEmail?.id).toBe(createdUser.id);

      const foundById = await userService.getUserById(createdUser.id);
      expect(foundById?.id).toBe(createdUser.id);

      const updatedUser = await userService.updateUser(createdUser.id, {
        name: "CRUD Test Updated",
      });
      expect(updatedUser.name).toBe("CRUD Test Updated");

      const deletedUser = await userService.deleteUser(createdUser.id);
      expect(deletedUser.id).toBe(createdUser.id);

      const shouldBeNull = await userService.getUserById(createdUser.id);
      expect(shouldBeNull).toBeNull();

      const index = testUsers.indexOf(createdUser.id);
      if (index > -1) {
        testUsers.splice(index, 1);
      }
    });
  });
});
