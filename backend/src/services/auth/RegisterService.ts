import { UserService } from "../user.service";
import { AuthService } from "./AuthService";

const userService = new UserService();
const authService = new AuthService();

export class RegisterService {
  async register(email: string, name: string, password: string) {
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
