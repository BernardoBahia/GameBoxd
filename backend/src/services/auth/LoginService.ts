import { UserService } from "../user.service";
import { AuthService } from "./AuthService";

const userService = new UserService();
const authService = new AuthService();

export class LoginService {
  async login(email: string, password: string) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const isValidPassword = await userService.validatePassword(
      password,
      user.password
    );

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
