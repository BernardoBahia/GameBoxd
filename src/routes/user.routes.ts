import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, AuthRequest } from "../middlewares/AuthMiddleware";

const router = Router();

// Rotas existentes
router.post("/users", UserController.createUser);
router.get("/users", UserController.getAllUsers);

router.get(
  "/users/profile",
  authMiddleware,
  (req: AuthRequest, res: Response) => {
    res.json({
      message: "Acesso autorizado!",
      user: req.user,
    });
  }
);

router.get("/users/:id", UserController.getUserById);
router.put("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);

// Nova rota protegida para testar o token

export default router;
