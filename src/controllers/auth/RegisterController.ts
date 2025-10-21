import { Request, Response } from "express";
import { RegisterService } from "../../services/auth/RegisterService";

const registerService = new RegisterService();

export class RegisterController {
  async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res
          .status(400)
          .json({ error: "Email, nome e senha são obrigatórios" });
      }

      const result = await registerService.register(email, name, password);

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
