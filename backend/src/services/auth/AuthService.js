"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jwt = require("jsonwebtoken");
class AuthService {
    jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
    generateToken(userId) {
        return jwt.sign({ userId }, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
        });
    }
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return { userId: decoded.userId };
        }
        catch (error) {
            throw new Error("Token inválido");
        }
    }
}
exports.AuthService = AuthService;
