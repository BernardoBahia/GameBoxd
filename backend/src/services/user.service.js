"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
class UserService {
    toUserModel(prismaUser) {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            bio: prismaUser.bio ?? null,
            passwordHash: prismaUser.password,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt ?? prismaUser.createdAt,
        };
    }
    async createUser(email, name, password) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const createdUser = await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                },
            });
            return this.toUserModel(createdUser);
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error);
            throw new Error("Falha ao criar usuário");
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { email },
            });
            return user ? this.toUserModel(user) : null;
        }
        catch (error) {
            console.error("Erro ao buscar usuário por e-mail:", error);
            throw new Error("Falha ao buscar usuário por e-mail");
        }
    }
    async validatePassword(plainPassword, hashedPassword) {
        try {
            return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
        }
        catch (error) {
            console.error("Erro ao validar senha do usuário:", error);
            throw new Error("Falha ao validar senha do usuário");
        }
    }
    async getAllUsers() {
        try {
            const users = await prisma_1.default.user.findMany();
            return users.map((user) => this.toUserModel(user));
        }
        catch (error) {
            console.error("Erro ao listar usuários:", error);
            throw new Error("Falha ao listar usuários");
        }
    }
    async getUserById(id) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id },
            });
            return user ? this.toUserModel(user) : null;
        }
        catch (error) {
            console.error("Erro ao buscar usuário por ID:", error);
            throw new Error("Falha ao buscar usuário por ID");
        }
    }
    async updateUser(id, data) {
        try {
            if (data.password) {
                data.password = await bcryptjs_1.default.hash(data.password, 10);
            }
            const updatedUser = await prisma_1.default.user.update({
                where: { id },
                data,
            });
            return this.toUserModel(updatedUser);
        }
        catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            throw new Error("Falha ao atualizar usuário");
        }
    }
    async deleteUser(id) {
        try {
            const deletedUser = await prisma_1.default.user.delete({
                where: { id },
            });
            return this.toUserModel(deletedUser);
        }
        catch (error) {
            console.error("Erro ao deletar usuário:", error);
            throw new Error("Falha ao deletar usuário");
        }
    }
    async getUserStats(userId) {
        try {
            const [reviewsCount, listsCount, likedGamesCount, gameStatus] = await Promise.all([
                prisma_1.default.review.count({ where: { userId } }),
                prisma_1.default.list.count({ where: { userId } }),
                prisma_1.default.userLikedGame.count({ where: { userId } }),
                prisma_1.default.userGameStatus.groupBy({
                    by: ["status"],
                    where: { userId },
                    _count: { status: true },
                }),
            ]);
            const statusCounts = {
                playing: 0,
                completed: 0,
                wantToPlay: 0,
            };
            gameStatus.forEach((status) => {
                if (status.status === "PLAYING")
                    statusCounts.playing = status._count.status;
                if (status.status === "COMPLETED")
                    statusCounts.completed = status._count.status;
                if (status.status === "WANT_TO_PLAY")
                    statusCounts.wantToPlay = status._count.status;
            });
            return {
                reviewsCount,
                listsCount,
                likedGamesCount,
                gamesCount: statusCounts.playing +
                    statusCounts.completed +
                    statusCounts.wantToPlay,
                statusCounts,
            };
        }
        catch (error) {
            console.error("Erro ao buscar estatísticas do usuário:", error);
            throw new Error("Falha ao buscar estatísticas do usuário");
        }
    }
    async getUserWithPublicData(userId) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    reviews: {
                        include: { game: true },
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                    lists: {
                        where: { isPublic: true },
                        include: {
                            listGames: {
                                include: { game: true },
                            },
                        },
                    },
                },
            });
            if (!user)
                return null;
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            console.error("Erro ao buscar dados públicos do usuário:", error);
            throw new Error("Falha ao buscar dados públicos do usuário");
        }
    }
}
exports.UserService = UserService;
