import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../../services/user.service";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { User } from "../../models/user.model";

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  return {
    PrismaClient: class {
      user = mockPrisma.user;
    },
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  hash: vi.fn(),
  compare: vi.fn(),
}));

import type { Mock } from "vitest";

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
    vi.clearAllMocks();
    userService = new UserService();
  });

  describe("createUser", () => {
    it("deve criar um novo usuário com sucesso", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      const mockPrismaUser = {
        id: "1",
        email: userData.email,
        name: userData.name,
        password: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
      prismaMock.create.mockResolvedValue(mockPrismaUser);

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
          password: "hashed_password",
        },
      });
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.passwordHash).toBe("hashed_password");
    });

    it("deve lançar erro ao falhar na criação", async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
      prismaMock.create.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.createUser("test@example.com", "Test", "password")
      ).rejects.toThrow("Falha ao criar usuário");
    });
  });

  describe("getUserByEmail", () => {
    it("deve retornar um usuário quando encontrado", async () => {
      const email = "test@example.com";
      const mockUser: User = {
        id: "1",
        email,
        name: "Test User",
        passwordHash: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.findUnique.mockResolvedValue(mockUser);

      const user = await userService.getUserByEmail(email);

      expect(prismaMock.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
      expect(user?.id).toBe("1");
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
    it("deve retornar true quando a senha estiver correta", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const isValid = await userService.validatePassword(
        mockUser.email,
        "password123"
      );

      expect(isValid).toBe(true);
    });

    it("deve retornar false quando a senha estiver incorreta", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const isValid = await userService.validatePassword(
        mockUser.email,
        "wrongpassword"
      );

      expect(isValid).toBe(false);
    });

    it("deve retornar false quando o usuário não existir", async () => {
      prismaMock.findUnique.mockResolvedValue(null);

      const isValid = await userService.validatePassword(
        "nonexistent@example.com",
        "password123"
      );

      expect(isValid).toBe(false);
    });
  });

  describe("getAllUsers", () => {
    it("deve retornar todos os usuários", async () => {
      const mockPrismaUsers = [
        {
          id: "1",
          email: "test1@example.com",
          name: "Test User 1",
          password: "hashed_password1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          email: "test2@example.com",
          name: "Test User 2",
          password: "hashed_password2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.findMany.mockResolvedValue(mockPrismaUsers);

      const users = await userService.getAllUsers();

      expect(prismaMock.findMany).toHaveBeenCalled();
      expect(users).toHaveLength(2);
      expect(users[0].email).toBe("test1@example.com");
      expect(users[1].email).toBe("test2@example.com");
    });

    it("deve retornar array vazio quando não há usuários", async () => {
      prismaMock.findMany.mockResolvedValue([]);

      const users = await userService.getAllUsers();

      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });

    it("deve lançar erro ao falhar na busca", async () => {
      prismaMock.findMany.mockRejectedValue(new Error("Database error"));

      await expect(userService.getAllUsers()).rejects.toThrow(
        "Falha ao listar usuários"
      );
    });
  });

  describe("getUserById", () => {
    it("deve retornar um usuário quando encontrado", async () => {
      const userId = "1";
      const mockUser: User = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed_password",
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
    it("deve atualizar um usuário com sucesso", async () => {
      const userId = "1";
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const mockUpdatedUser: User = {
        id: userId,
        email: updateData.email,
        name: updateData.name,
        passwordHash: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.update.mockResolvedValue(mockUpdatedUser);

      const user = await userService.updateUser(userId, updateData);

      expect(prismaMock.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(user.name).toBe(updateData.name);
      expect(user.email).toBe(updateData.email);
    });

    it("deve atualizar apenas os campos fornecidos", async () => {
      const userId = "1";
      const updateData = { name: "Only Name Updated" };

      const mockUpdatedUser: User = {
        id: userId,
        email: "same@example.com",
        name: updateData.name,
        passwordHash: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.update.mockResolvedValue(mockUpdatedUser);

      await userService.updateUser(userId, updateData);

      expect(prismaMock.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
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
      const userId = "1";
      const mockDeletedUser: User = {
        id: userId,
        email: "deleted@example.com",
        name: "Deleted User",
        passwordHash: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.delete.mockResolvedValue(mockDeletedUser);

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
