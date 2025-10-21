import { Request, Response } from "express";
import { LoginService } from "../../services/auth/LoginService";

const loginService = new LoginService();

export class LoginController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email e senha são obrigatórios" });
      }

      const result = await loginService.login(email, password);

      res.json(result);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}
