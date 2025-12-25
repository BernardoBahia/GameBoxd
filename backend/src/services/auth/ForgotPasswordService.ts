import crypto from "crypto";
import { UserService } from "../user.service";

const userService = new UserService();

export class ForgotPasswordService {
  private resetTokens: Map<string, { userId: string; expiresAt: Date }> =
    new Map();

  async requestPasswordReset(email: string) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
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

  async resetPassword(resetToken: string, newPassword: string) {
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
