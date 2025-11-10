import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock do PrismaClient - DEVE estar antes dos imports
vi.mock("@prisma/client", () => {
  const mockUser = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return {
    PrismaClient: class {
      user = mockUser;
    },
  };
});

// Mock do bcrypt - DEVE estar antes dos imports
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

import { UserService } from "../../services/user.service";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Mock } from "vitest";

// Criar uma instância para acessar os mocks
const prisma = new PrismaClient();
const prismaMock = prisma.user as unknown as {
  create: Mock;
  findUnique: Mock;
  findMany: Mock;
  update: Mock;
  delete: Mock;
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    vi.clearAllMocks();
    userService = new UserService();
  });

  describe("createUser", () => {
    it("deve criar um usuário com sucesso", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      const hashedPassword = "hashedPassword123";
      const createdUserData = {
        id: "123",
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      prismaMock.create.mockResolvedValue(createdUserData);

      const user = await userService.createUser(
        userData.email,
        userData.name,
        userData.password
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(prismaMock.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
        },
      });
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.id).toBe("123");
    });

    it("deve lançar erro ao falhar na criação do usuário", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      vi.mocked(bcrypt.hash).mockResolvedValue("hashedPassword" as never);
      prismaMock.create.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.createUser(userData.email, userData.name, userData.password)
      ).rejects.toThrow("Falha ao criar usuário");
    });
  });

  describe("getUserByEmail", () => {
    it("deve retornar um usuário quando encontrado", async () => {
      const userEmail = "test@example.com";
      const mockUser = {
        id: "123",
        email: userEmail,
        name: "Test User",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.findUnique.mockResolvedValue(mockUser);

      const user = await userService.getUserByEmail(userEmail);

      expect(prismaMock.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(userEmail);
      expect(user?.id).toBe("123");
    });

    it("deve retornar null quando usuário não encontrado", async () => {
      prismaMock.findUnique.mockResolvedValue(null);

      const user = await userService.getUserByEmail("notfound@example.com");

      expect(user).toBeNull();
    });

    it("deve lançar erro ao falhar na busca", async () => {
      prismaMock.findUnique.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.getUserByEmail("test@example.com")
      ).rejects.toThrow("Falha ao buscar usuário por e-mail");
    });
  });

  describe("validatePassword", () => {
    it("deve retornar true para senha válida", async () => {
      const plainPassword = "password123";
      const hashedPassword = "hashedPassword";

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const isValid = await userService.validatePassword(
        plainPassword,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword
      );
      expect(isValid).toBe(true);
    });

    it("deve retornar false para senha inválida", async () => {
      const plainPassword = "wrongpassword";
      const hashedPassword = "hashedPassword";

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const isValid = await userService.validatePassword(
        plainPassword,
        hashedPassword
      );

      expect(isValid).toBe(false);
    });

    it("deve lançar erro ao falhar na validação", async () => {
      vi.mocked(bcrypt.compare).mockRejectedValue(new Error("Bcrypt error"));

      await expect(
        userService.validatePassword("password", "hash")
      ).rejects.toThrow("Falha ao validar senha do usuário");
    });
  });

  describe("getAllUsers", () => {
    it("deve retornar lista de usuários", async () => {
      const mockUsers = [
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          password: "hash1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          password: "hash2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.findMany.mockResolvedValue(mockUsers);

      const users = await userService.getAllUsers();

      expect(prismaMock.findMany).toHaveBeenCalled();
      expect(users).toHaveLength(2);
      expect(users[0].email).toBe("user1@example.com");
      expect(users[1].email).toBe("user2@example.com");
    });

    it("deve retornar array vazio quando não há usuários", async () => {
      prismaMock.findMany.mockResolvedValue([]);

      const users = await userService.getAllUsers();

      expect(users).toHaveLength(0);
    });

    it("deve lançar erro ao falhar na listagem", async () => {
      prismaMock.findMany.mockRejectedValue(new Error("Database error"));

      await expect(userService.getAllUsers()).rejects.toThrow(
        "Falha ao listar usuários"
      );
    });
  });

  describe("getUserById", () => {
    it("deve retornar um usuário quando encontrado", async () => {
      const userId = "123";
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.findUnique.mockResolvedValue(mockUser);

      const user = await userService.getUserById(userId);

      expect(prismaMock.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
    });

    it("deve retornar null quando usuário não encontrado", async () => {
      prismaMock.findUnique.mockResolvedValue(null);

      const user = await userService.getUserById("999");

      expect(user).toBeNull();
    });

    it("deve lançar erro ao falhar na busca", async () => {
      prismaMock.findUnique.mockRejectedValue(new Error("Database error"));

      await expect(userService.getUserById("123")).rejects.toThrow(
        "Falha ao buscar usuário por ID"
      );
    });
  });

  describe("updateUser", () => {
    it("deve atualizar um usuário sem alterar senha", async () => {
      const userId = "123";
      const updateData = {
        email: "newemail@example.com",
        name: "New Name",
      };

      const updatedUser = {
        id: userId,
        email: updateData.email,
        name: updateData.name,
        password: "oldHash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.update.mockResolvedValue(updatedUser);

      const user = await userService.updateUser(userId, updateData);

      expect(prismaMock.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(user.email).toBe(updateData.email);
      expect(user.name).toBe(updateData.name);
    });

    it("deve atualizar senha quando fornecida", async () => {
      const userId = "123";
      const newPassword = "newPassword123";
      const hashedPassword = "newHashedPassword";

      const updateData = {
        password: newPassword,
      };

      const updatedUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      prismaMock.update.mockResolvedValue(updatedUser);

      await userService.updateUser(userId, updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(prismaMock.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    });

    it("deve lançar erro ao falhar na atualização", async () => {
      prismaMock.update.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.updateUser("123", { name: "New Name" })
      ).rejects.toThrow("Falha ao atualizar usuário");
    });
  });

  describe("deleteUser", () => {
    it("deve deletar um usuário com sucesso", async () => {
      const userId = "123";
      const deletedUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.delete.mockResolvedValue(deletedUser);

      const user = await userService.deleteUser(userId);

      expect(prismaMock.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(user.id).toBe(userId);
    });

    it("deve lançar erro ao falhar na exclusão", async () => {
      prismaMock.delete.mockRejectedValue(new Error("Database error"));

      await expect(userService.deleteUser("123")).rejects.toThrow(
        "Falha ao deletar usuário"
      );
    });
  });
});
