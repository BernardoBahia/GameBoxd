"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_service_1 = require("../../services/user.service");
vitest_1.vi.mock("@prisma/client", () => {
    const mockPrisma = {
        user: {
            create: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            delete: vitest_1.vi.fn(),
        },
    };
    return {
        PrismaClient: class {
            user = mockPrisma.user;
        },
    };
});
// Mock do bcrypt
vitest_1.vi.mock("bcryptjs", () => ({
    default: {
        hash: vitest_1.vi.fn(),
        compare: vitest_1.vi.fn(),
    },
    hash: vitest_1.vi.fn(),
    compare: vitest_1.vi.fn(),
}));
const prisma = new client_1.PrismaClient();
const prismaMock = prisma.user;
(0, vitest_1.describe)("UserService", () => {
    let userService;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        userService = new user_service_1.UserService();
    });
    (0, vitest_1.describe)("createUser", () => {
        (0, vitest_1.it)("deve criar um novo usuário com sucesso", async () => {
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
            vitest_1.vi.mocked(bcryptjs_1.default.hash).mockResolvedValue("hashed_password");
            prismaMock.create.mockResolvedValue(mockPrismaUser);
            const user = await userService.createUser(userData.email, userData.name, userData.password);
            (0, vitest_1.expect)(bcryptjs_1.default.hash).toHaveBeenCalledWith(userData.password, 10);
            (0, vitest_1.expect)(prismaMock.create).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    name: userData.name,
                    password: "hashed_password",
                },
            });
            (0, vitest_1.expect)(user.email).toBe(userData.email);
            (0, vitest_1.expect)(user.name).toBe(userData.name);
            (0, vitest_1.expect)(user.passwordHash).toBe("hashed_password");
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na criação", async () => {
            vitest_1.vi.mocked(bcryptjs_1.default.hash).mockResolvedValue("hashed_password");
            prismaMock.create.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(userService.createUser("test@example.com", "Test", "password")).rejects.toThrow("Falha ao criar usuário");
        });
    });
    (0, vitest_1.describe)("getUserByEmail", () => {
        (0, vitest_1.it)("deve retornar um usuário quando encontrado", async () => {
            const email = "test@example.com";
            const mockUser = {
                id: "1",
                email,
                name: "Test User",
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.findUnique.mockResolvedValue(mockUser);
            const user = await userService.getUserByEmail(email);
            (0, vitest_1.expect)(prismaMock.findUnique).toHaveBeenCalledWith({
                where: { email },
            });
            (0, vitest_1.expect)(user).toBeDefined();
            (0, vitest_1.expect)(user?.email).toBe(email);
            (0, vitest_1.expect)(user?.id).toBe("1");
        });
        (0, vitest_1.it)("deve retornar null quando usuário não encontrado", async () => {
            prismaMock.findUnique.mockResolvedValue(null);
            const user = await userService.getUserByEmail("notfound@example.com");
            (0, vitest_1.expect)(user).toBeNull();
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na busca", async () => {
            prismaMock.findUnique.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(userService.getUserByEmail("test@example.com")).rejects.toThrow("Falha ao buscar usuário por e-mail");
        });
    });
    (0, vitest_1.describe)("validatePassword", () => {
        (0, vitest_1.it)("deve retornar true quando a senha estiver correta", async () => {
            const mockUser = {
                id: "1",
                email: "test@example.com",
                name: "Test User",
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.findUnique.mockResolvedValue(mockUser);
            vitest_1.vi.mocked(bcryptjs_1.default.compare).mockResolvedValue(true);
            const isValid = await userService.validatePassword(mockUser.email, "password123");
            (0, vitest_1.expect)(isValid).toBe(true);
        });
        (0, vitest_1.it)("deve retornar false quando a senha estiver incorreta", async () => {
            const mockUser = {
                id: "1",
                email: "test@example.com",
                name: "Test User",
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.findUnique.mockResolvedValue(mockUser);
            vitest_1.vi.mocked(bcryptjs_1.default.compare).mockResolvedValue(false);
            const isValid = await userService.validatePassword(mockUser.email, "wrongpassword");
            (0, vitest_1.expect)(isValid).toBe(false);
        });
        (0, vitest_1.it)("deve retornar false quando o usuário não existir", async () => {
            prismaMock.findUnique.mockResolvedValue(null);
            const isValid = await userService.validatePassword("nonexistent@example.com", "password123");
            (0, vitest_1.expect)(isValid).toBe(false);
        });
    });
    (0, vitest_1.describe)("getAllUsers", () => {
        (0, vitest_1.it)("deve retornar todos os usuários", async () => {
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
            (0, vitest_1.expect)(prismaMock.findMany).toHaveBeenCalled();
            (0, vitest_1.expect)(users).toHaveLength(2);
            (0, vitest_1.expect)(users[0].email).toBe("test1@example.com");
            (0, vitest_1.expect)(users[1].email).toBe("test2@example.com");
        });
        (0, vitest_1.it)("deve retornar array vazio quando não há usuários", async () => {
            prismaMock.findMany.mockResolvedValue([]);
            const users = await userService.getAllUsers();
            (0, vitest_1.expect)(users).toEqual([]);
            (0, vitest_1.expect)(users).toHaveLength(0);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na busca", async () => {
            prismaMock.findMany.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(userService.getAllUsers()).rejects.toThrow("Falha ao listar usuários");
        });
    });
    (0, vitest_1.describe)("getUserById", () => {
        (0, vitest_1.it)("deve retornar um usuário quando encontrado", async () => {
            const userId = "1";
            const mockUser = {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.findUnique.mockResolvedValue(mockUser);
            const user = await userService.getUserById(userId);
            (0, vitest_1.expect)(prismaMock.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
            (0, vitest_1.expect)(user).toBeDefined();
            (0, vitest_1.expect)(user?.id).toBe(userId);
        });
        (0, vitest_1.it)("deve retornar null quando usuário não encontrado", async () => {
            prismaMock.findUnique.mockResolvedValue(null);
            const user = await userService.getUserById("999");
            (0, vitest_1.expect)(user).toBeNull();
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na busca", async () => {
            prismaMock.findUnique.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(userService.getUserById("123")).rejects.toThrow("Falha ao buscar usuário por ID");
        });
    });
    (0, vitest_1.describe)("updateUser", () => {
        (0, vitest_1.it)("deve atualizar um usuário com sucesso", async () => {
            const userId = "1";
            const updateData = {
                name: "Updated Name",
                email: "updated@example.com",
            };
            const mockUpdatedUser = {
                id: userId,
                email: updateData.email,
                name: updateData.name,
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.update.mockResolvedValue(mockUpdatedUser);
            const user = await userService.updateUser(userId, updateData);
            (0, vitest_1.expect)(prismaMock.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: updateData,
            });
            (0, vitest_1.expect)(user.name).toBe(updateData.name);
            (0, vitest_1.expect)(user.email).toBe(updateData.email);
        });
        (0, vitest_1.it)("deve atualizar apenas os campos fornecidos", async () => {
            const userId = "1";
            const updateData = { name: "Only Name Updated" };
            const mockUpdatedUser = {
                id: userId,
                email: "same@example.com",
                name: updateData.name,
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.update.mockResolvedValue(mockUpdatedUser);
            await userService.updateUser(userId, updateData);
            (0, vitest_1.expect)(prismaMock.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: updateData,
            });
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na atualização", async () => {
            prismaMock.update.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(userService.updateUser("123", { name: "New Name" })).rejects.toThrow("Falha ao atualizar usuário");
        });
    });
    (0, vitest_1.describe)("deleteUser", () => {
        (0, vitest_1.it)("deve deletar um usuário com sucesso", async () => {
            const userId = "1";
            const mockDeletedUser = {
                id: userId,
                email: "deleted@example.com",
                name: "Deleted User",
                passwordHash: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaMock.delete.mockResolvedValue(mockDeletedUser);
            const user = await userService.deleteUser(userId);
            (0, vitest_1.expect)(prismaMock.delete).toHaveBeenCalledWith({
                where: { id: userId },
            });
            (0, vitest_1.expect)(user.id).toBe(userId);
        });
        (0, vitest_1.it)("deve lançar erro ao falhar na exclusão", async () => {
            prismaMock.delete.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(userService.deleteUser("123")).rejects.toThrow("Falha ao deletar usuário");
        });
    });
});
