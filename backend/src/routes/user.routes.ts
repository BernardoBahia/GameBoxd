import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, AuthRequest } from "../middlewares/AuthMiddleware";

const router = Router();

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
router.get("/users/:id/stats", UserController.getUserStats);
router.get("/users/:id/public", UserController.getUserWithPublicData);
router.put("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);

export default router;
