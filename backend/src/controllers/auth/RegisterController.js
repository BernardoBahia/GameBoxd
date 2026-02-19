"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const RegisterService_1 = require("../../services/auth/RegisterService");
const registerService = new RegisterService_1.RegisterService();
class RegisterController {
    async register(req, res) {
        try {
            const { email, name, password } = req.body;
            if (!email || !name || !password) {
                return res
                    .status(400)
                    .json({ error: "Email, nome e senha são obrigatórios" });
            }
            const result = await registerService.register(email, name, password);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.RegisterController = RegisterController;
