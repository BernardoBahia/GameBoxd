"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const user_service_1 = require("../../services/user.service");
const prisma_1 = __importDefault(require("../../lib/prisma"));
(0, vitest_1.describe)("UserService - Testes de Integração", () => {
    let userService;
    const testUsers = [];
    (0, vitest_1.beforeAll)(async () => {
        await prisma_1.default.$connect();
    });
    (0, vitest_1.afterAll)(async () => {
        if (testUsers.length > 0) {
            await prisma_1.default.user.deleteMany({
                where: {
                    id: {
                        in: testUsers,
                    },
                },
            });
        }
        await prisma_1.default.$disconnect();
    });
    (0, vitest_1.beforeEach)(() => {
        userService = new user_service_1.UserService();
    });
    (0, vitest_1.describe)("createUser", () => {
        (0, vitest_1.it)("deve criar um novo usuário no banco de dados", async () => {
            const userData = {
                email: `test-${Date.now()}@example.com`,
                name: "Test User",
                password: "password123",
            };
            const user = await userService.createUser(userData.email, userData.name, userData.password);
            testUsers.push(user.id);
            (0, vitest_1.expect)(user).toBeDefined();
            (0, vitest_1.expect)(user.id).toBeDefined();
            (0, vitest_1.expect)(user.email).toBe(userData.email);
            (0, vitest_1.expect)(user.name).toBe(userData.name);
            (0, vitest_1.expect)(user.passwordHash).toBeDefined();
            (0, vitest_1.expect)(user.passwordHash).not.toBe(userData.password);
            (0, vitest_1.expect)(user.createdAt).toBeInstanceOf(Date);
            (0, vitest_1.expect)(user.updatedAt).toBeInstanceOf(Date);
            const dbUser = await prisma_1.default.user.findUnique({
                where: { id: user.id },
            });
            (0, vitest_1.expect)(dbUser).toBeDefined();
            (0, vitest_1.expect)(dbUser?.email).toBe(userData.email);
        });
        (0, vitest_1.it)("deve criar senha hasheada com bcrypt", async () => {
            const userData = {
                email: `test-hash-${Date.now()}@example.com`,
                name: "Hash Test User",
                password: "mySecretPassword",
            };
            const user = await userService.createUser(userData.email, userData.name, userData.password);
            testUsers.push(user.id);
            (0, vitest_1.expect)(user.passwordHash).toMatch(/^\$2[ab]\$/);
            (0, vitest_1.expect)(user.passwordHash).not.toBe(userData.password);
        });
        (0, vitest_1.it)("deve lançar erro ao tentar criar usuário com email duplicado", async () => {
            const email = `duplicate-${Date.now()}@example.com`;
            const user1 = await userService.createUser(email, "First User", "password123");
            testUsers.push(user1.id);
            await (0, vitest_1.expect)(userService.createUser(email, "Second User", "password456")).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("getUserByEmail", () => {
        (0, vitest_1.it)("deve buscar usuário existente por email", async () => {
            const email = `find-by-email-${Date.now()}@example.com`;
            const createdUser = await userService.createUser(email, "Find Me", "password123");
            testUsers.push(createdUser.id);
            const foundUser = await userService.getUserByEmail(email);
            (0, vitest_1.expect)(foundUser).toBeDefined();
            (0, vitest_1.expect)(foundUser?.id).toBe(createdUser.id);
            (0, vitest_1.expect)(foundUser?.email).toBe(email);
            (0, vitest_1.expect)(foundUser?.name).toBe("Find Me");
        });
        (0, vitest_1.it)("deve retornar null para email inexistente", async () => {
            const user = await userService.getUserByEmail("nonexistent@example.com");
            (0, vitest_1.expect)(user).toBeNull();
        });
    });
    (0, vitest_1.describe)("validatePassword", () => {
        (0, vitest_1.it)("deve validar senha correta", async () => {
            const password = "correctPassword123";
            const email = `validate-${Date.now()}@example.com`;
            const user = await userService.createUser(email, "Password Test", password);
            testUsers.push(user.id);
            const isValid = await userService.validatePassword(password, user.passwordHash);
            (0, vitest_1.expect)(isValid).toBe(true);
        });
        (0, vitest_1.it)("deve rejeitar senha incorreta", async () => {
            const email = `wrong-password-${Date.now()}@example.com`;
            const user = await userService.createUser(email, "Password Test", "correctPassword");
            testUsers.push(user.id);
            const isValid = await userService.validatePassword("wrongPassword", user.passwordHash);
            (0, vitest_1.expect)(isValid).toBe(false);
        });
    });
    (0, vitest_1.describe)("getAllUsers", () => {
        (0, vitest_1.it)("deve retornar lista de usuários", async () => {
            const user1 = await userService.createUser(`list-1-${Date.now()}@example.com`, "User 1", "password1");
            const user2 = await userService.createUser(`list-2-${Date.now()}@example.com`, "User 2", "password2");
            testUsers.push(user1.id, user2.id);
            const users = await userService.getAllUsers();
            (0, vitest_1.expect)(users).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(users)).toBe(true);
            (0, vitest_1.expect)(users.length).toBeGreaterThanOrEqual(2);
            const userIds = users.map((u) => u.id);
            (0, vitest_1.expect)(userIds).toContain(user1.id);
            (0, vitest_1.expect)(userIds).toContain(user2.id);
        });
    });
    (0, vitest_1.describe)("getUserById", () => {
        (0, vitest_1.it)("deve buscar usuário por ID", async () => {
            const email = `find-by-id-${Date.now()}@example.com`;
            const createdUser = await userService.createUser(email, "Find By ID", "password123");
            testUsers.push(createdUser.id);
            const foundUser = await userService.getUserById(createdUser.id);
            (0, vitest_1.expect)(foundUser).toBeDefined();
            (0, vitest_1.expect)(foundUser?.id).toBe(createdUser.id);
            (0, vitest_1.expect)(foundUser?.email).toBe(email);
            (0, vitest_1.expect)(foundUser?.name).toBe("Find By ID");
        });
        (0, vitest_1.it)("deve retornar null para ID inexistente", async () => {
            const user = await userService.getUserById("00000000-0000-0000-0000-000000000000");
            (0, vitest_1.expect)(user).toBeNull();
        });
    });
    (0, vitest_1.describe)("updateUser", () => {
        (0, vitest_1.it)("deve atualizar nome do usuário", async () => {
            const email = `update-name-${Date.now()}@example.com`;
            const user = await userService.createUser(email, "Original Name", "password123");
            testUsers.push(user.id);
            const updatedUser = await userService.updateUser(user.id, {
                name: "Updated Name",
            });
            (0, vitest_1.expect)(updatedUser.id).toBe(user.id);
            (0, vitest_1.expect)(updatedUser.name).toBe("Updated Name");
            (0, vitest_1.expect)(updatedUser.email).toBe(email);
            const dbUser = await prisma_1.default.user.findUnique({
                where: { id: user.id },
            });
            (0, vitest_1.expect)(dbUser?.name).toBe("Updated Name");
        });
        (0, vitest_1.it)("deve atualizar email do usuário", async () => {
            const originalEmail = `update-email-${Date.now()}@example.com`;
            const newEmail = `new-email-${Date.now()}@example.com`;
            const user = await userService.createUser(originalEmail, "Email Test", "password123");
            testUsers.push(user.id);
            const updatedUser = await userService.updateUser(user.id, {
                email: newEmail,
            });
            (0, vitest_1.expect)(updatedUser.email).toBe(newEmail);
            const dbUser = await prisma_1.default.user.findUnique({
                where: { id: user.id },
            });
            (0, vitest_1.expect)(dbUser?.email).toBe(newEmail);
        });
        (0, vitest_1.it)("deve atualizar senha do usuário e hashear nova senha", async () => {
            const email = `update-password-${Date.now()}@example.com`;
            const oldPassword = "oldPassword123";
            const newPassword = "newPassword456";
            const user = await userService.createUser(email, "Password Update Test", oldPassword);
            testUsers.push(user.id);
            const updatedUser = await userService.updateUser(user.id, {
                password: newPassword,
            });
            (0, vitest_1.expect)(updatedUser.passwordHash).not.toBe(user.passwordHash);
            const isNewPasswordValid = await userService.validatePassword(newPassword, updatedUser.passwordHash);
            (0, vitest_1.expect)(isNewPasswordValid).toBe(true);
            const isOldPasswordValid = await userService.validatePassword(oldPassword, updatedUser.passwordHash);
            (0, vitest_1.expect)(isOldPasswordValid).toBe(false);
        });
        (0, vitest_1.it)("deve atualizar múltiplos campos ao mesmo tempo", async () => {
            const originalEmail = `update-multiple-${Date.now()}@example.com`;
            const newEmail = `new-multiple-${Date.now()}@example.com`;
            const user = await userService.createUser(originalEmail, "Original Name", "password123");
            testUsers.push(user.id);
            const updatedUser = await userService.updateUser(user.id, {
                email: newEmail,
                name: "New Name",
                password: "newPassword",
            });
            (0, vitest_1.expect)(updatedUser.email).toBe(newEmail);
            (0, vitest_1.expect)(updatedUser.name).toBe("New Name");
            (0, vitest_1.expect)(updatedUser.passwordHash).not.toBe(user.passwordHash);
            const isPasswordValid = await userService.validatePassword("newPassword", updatedUser.passwordHash);
            (0, vitest_1.expect)(isPasswordValid).toBe(true);
        });
    });
    (0, vitest_1.describe)("deleteUser", () => {
        (0, vitest_1.it)("deve deletar usuário do banco de dados", async () => {
            const email = `delete-${Date.now()}@example.com`;
            const user = await userService.createUser(email, "To Be Deleted", "password123");
            const deletedUser = await userService.deleteUser(user.id);
            (0, vitest_1.expect)(deletedUser.id).toBe(user.id);
            (0, vitest_1.expect)(deletedUser.email).toBe(email);
            const dbUser = await prisma_1.default.user.findUnique({
                where: { id: user.id },
            });
            (0, vitest_1.expect)(dbUser).toBeNull();
            const index = testUsers.indexOf(user.id);
            if (index > -1) {
                testUsers.splice(index, 1);
            }
        });
        (0, vitest_1.it)("deve lançar erro ao tentar deletar usuário inexistente", async () => {
            await (0, vitest_1.expect)(userService.deleteUser("00000000-0000-0000-0000-000000000000")).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)("Fluxo completo de CRUD", () => {
        (0, vitest_1.it)("deve executar operações CRUD completas", async () => {
            const email = `crud-flow-${Date.now()}@example.com`;
            const createdUser = await userService.createUser(email, "CRUD Test", "password123");
            testUsers.push(createdUser.id);
            (0, vitest_1.expect)(createdUser.email).toBe(email);
            const foundByEmail = await userService.getUserByEmail(email);
            (0, vitest_1.expect)(foundByEmail?.id).toBe(createdUser.id);
            const foundById = await userService.getUserById(createdUser.id);
            (0, vitest_1.expect)(foundById?.id).toBe(createdUser.id);
            const updatedUser = await userService.updateUser(createdUser.id, {
                name: "CRUD Test Updated",
            });
            (0, vitest_1.expect)(updatedUser.name).toBe("CRUD Test Updated");
            const deletedUser = await userService.deleteUser(createdUser.id);
            (0, vitest_1.expect)(deletedUser.id).toBe(createdUser.id);
            const shouldBeNull = await userService.getUserById(createdUser.id);
            (0, vitest_1.expect)(shouldBeNull).toBeNull();
            const index = testUsers.indexOf(createdUser.id);
            if (index > -1) {
                testUsers.splice(index, 1);
            }
        });
    });
});
