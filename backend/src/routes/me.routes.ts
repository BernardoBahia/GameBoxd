import { Router } from "express";
import { MeController } from "../controllers/me.controller";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { uploadAvatar } from "../middlewares/upload.middleware";

const router = Router();

router.get("/me", authMiddleware, MeController.getMe);
router.patch("/me", authMiddleware, MeController.patchMe);
router.patch("/me/name", authMiddleware, MeController.patchName);
router.post("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), MeController.postAvatar);

export default router;