"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordController = void 0;
const ForgotPasswordService_1 = require("../../services/auth/ForgotPasswordService");
const forgotPasswordService = new ForgotPasswordService_1.ForgotPasswordService();
class ForgotPasswordController {
    async requestReset(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: "Email é obrigatório" });
            }
            const result = await forgotPasswordService.requestPasswordReset(email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async resetPassword(req, res) {
        try {
            const { resetToken, newPassword } = req.body;
            if (!resetToken || !newPassword) {
                return res
                    .status(400)
                    .json({ error: "Token e nova senha são obrigatórios" });
            }
            const result = await forgotPasswordService.resetPassword(resetToken, newPassword);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ForgotPasswordController = ForgotPasswordController;
