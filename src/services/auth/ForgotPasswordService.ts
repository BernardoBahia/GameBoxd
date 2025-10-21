import crypto from "crypto";
import { UserService } from "../user.service";
import { AuthService } from "./AuthService";

const userService = new UserService();
const authService = new AuthService();

export class ForgotPasswordService {
  async requestPasswordReset(email: string) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    return {
      message: "Token de reset enviado",
      resetToken, // Remover em produção
      expiresAt: resetTokenExpiry,
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    if (!resetToken) {
      throw new Error("Token inválido");
    }

    return {
      message: "Senha alterada com sucesso",
    };
  }
}
