import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { sendPasswordResetEmail } from "../../lib/email";
import { validatePassword } from "../../utils/password-rules";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export class ForgotPasswordService {
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica — não revela se o e-mail existe (evita enumeração)
    const generic = {
      message:
        "Se esse e-mail estiver cadastrado, você receberá um link em breve.",
    };

    if (!user) return generic;

    // Invalida tokens anteriores não utilizados do mesmo usuário
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.passwordResetToken.create({
      data: { token: rawToken, userId: user.id, expiresAt },
    });

    const frontendUrl =
      process.env.FRONTEND_URL ?? "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch (emailError) {
      console.error("[ForgotPassword] Falha ao enviar e-mail:", emailError);
      console.warn("[ForgotPassword] Link de reset (use para testes):", resetLink);
      throw new Error("EMAIL_SEND_FAILED");
    }

    return generic;
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!rawToken || !newPassword) {
      throw new Error("Token e nova senha são obrigatórios");
    }

    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
      throw new Error(errors.join("; "));
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: rawToken },
    });

    if (!record || record.usedAt !== null) {
      throw new Error("Token inválido ou já utilizado");
    }

    if (new Date() > record.expiresAt) {
      throw new Error("Token expirado. Solicite um novo link.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: "Senha redefinida com sucesso" };
  }

  async validateToken(rawToken: string): Promise<{ valid: boolean; error?: string }> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: rawToken },
    });

    if (!record || record.usedAt !== null) {
      return { valid: false, error: "Token inválido ou já utilizado" };
    }

    if (new Date() > record.expiresAt) {
      return { valid: false, error: "Token expirado. Solicite um novo link." };
    }

    return { valid: true };
  }
}