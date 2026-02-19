"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const user_service_1 = require("../user.service");
const AuthService_1 = require("./AuthService");
const userService = new user_service_1.UserService();
const authService = new AuthService_1.AuthService();
class LoginService {
    async login(email, password) {
        const user = await userService.getUserByEmail(email);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        const isValidPassword = await userService.validatePassword(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error("Senha inválida");
        }
        const token = authService.generateToken(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }
}
exports.LoginService = LoginService;
