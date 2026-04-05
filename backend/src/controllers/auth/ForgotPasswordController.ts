import { Request, Response } from "express";
import { ForgotPasswordService } from "../../services/auth/ForgotPasswordService";

const forgotPasswordService = new ForgotPasswordService();

export class ForgotPasswordController {
  async requestReset(req: Request, res: Response) {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "E-mail é obrigatório" });
    }

    try {
      const result = await forgotPasswordService.requestPasswordReset(email.trim().toLowerCase());
      return res.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "EMAIL_SEND_FAILED") {
        return res.status(500).json({
          error: "Não foi possível enviar o e-mail. Verifique se o endereço está correto ou tente novamente mais tarde.",
        });
      }
      console.error("[ForgotPassword] requestReset error:", error);
      return res.status(500).json({ error: "Erro interno. Tente novamente." });
    }
  }

  async validateToken(req: Request, res: Response) {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ valid: false, error: "Token é obrigatório" });
    }

    try {
      const result = await forgotPasswordService.validateToken(token);
      return res.json(result);
    } catch (error) {
      console.error("[ForgotPassword] validateToken error:", error);
      return res.status(500).json({ valid: false, error: "Erro interno." });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "Token e nova senha são obrigatórios" });
    }

    try {
      const result = await forgotPasswordService.resetPassword(resetToken, newPassword);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
