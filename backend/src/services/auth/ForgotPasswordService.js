"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_service_1 = require("../user.service");
const userService = new user_service_1.UserService();
class ForgotPasswordService {
    resetTokens = new Map();
    async requestPasswordReset(email) {
        const user = await userService.getUserByEmail(email);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        this.resetTokens.set(resetToken, {
            userId: user.id,
            expiresAt: resetTokenExpiry,
        });
        return {
            message: "Token de reset enviado",
            resetToken,
            expiresAt: resetTokenExpiry,
        };
    }
    async resetPassword(resetToken, newPassword) {
        const tokenData = this.resetTokens.get(resetToken);
        if (!tokenData) {
            throw new Error("Token inválido ou expirado");
        }
        if (new Date() > tokenData.expiresAt) {
            this.resetTokens.delete(resetToken);
            throw new Error("Token expirado");
        }
        await userService.updateUser(tokenData.userId, {
            password: newPassword,
        });
        this.resetTokens.delete(resetToken);
        return {
            message: "Senha alterada com sucesso",
        };
    }
}
exports.ForgotPasswordService = ForgotPasswordService;
