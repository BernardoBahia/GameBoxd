const jwt = require("jsonwebtoken");

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  private jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error("Token inválido");
    }
  }
}
