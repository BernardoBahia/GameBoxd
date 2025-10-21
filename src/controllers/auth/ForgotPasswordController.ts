import { Request, Response } from "express";
import { ForgotPasswordService } from "../../services/auth/ForgotPasswordService";

const forgotPasswordService = new ForgotPasswordService();

export class ForgotPasswordController {
  async requestReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }

      const result = await forgotPasswordService.requestPasswordReset(email);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !newPassword) {
        return res
          .status(400)
          .json({ error: "Token e nova senha são obrigatórios" });
      }

      const result = await forgotPasswordService.resetPassword(
        resetToken,
        newPassword
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
