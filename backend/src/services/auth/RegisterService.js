"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = void 0;
const user_service_1 = require("../user.service");
const AuthService_1 = require("./AuthService");
const userService = new user_service_1.UserService();
const authService = new AuthService_1.AuthService();
class RegisterService {
    async register(email, name, password) {
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            throw new Error("Email já cadastrado");
        }
        const user = await userService.createUser(email, name, password);
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
exports.RegisterService = RegisterService;
